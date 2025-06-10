/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getTeam, Member, TeamType } from "@/app/api/get-team-member/route";
import { fetchTeamTasks } from "@/app/api/get-team-task/route";
import {
  EmploymentDetailResponse,
  fetchEmploymentDetail,
} from "@/app/api/employment-detail/route";
import { fetchUserById } from "@/app/api/get-user-information/route";
import { Separator } from "@/components/ui/separator";
import { TaskViewDialog } from "@/components/task/task-view-dialog";
import { CreateTaskCard } from "@/components/task/create-task-card";
import { cn } from "@/lib/utils";
import { TaskType } from "@/app/api/get-user-task/route";
import { createTask } from "@/app/api/create-task/route";
import { updateTaskStatus } from "@/app/api/change-task-status/route";
import { toast } from "sonner";

interface ExtendedMember extends Member {
  email: string;
  phone_number: string;
}

// Hàm lấy màu sắc và nhãn cho trạng thái task
const getStatusBadge = (status: TaskType["status"]) => {
  switch (status) {
    case "completed":
      return {
        variant: "default" as const,
        className: "bg-green-500/10 text-green-500 border-green-500/20",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        label: "Completed",
      };
    case "in_progress":
      return {
        variant: "secondary" as const,
        className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        icon: <Clock className="h-3 w-3 mr-1" />,
        label: "In Progress",
      };
    case "failed":
      return {
        variant: "destructive" as const,
        className: "bg-red-500/10 text-red-500 border-red-500/20",
        icon: <XCircle className="h-3 w-3 mr-1" />,
        label: "Failed",
      };
    case "pending":
      return {
        variant: "secondary" as const,
        className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        label: "Pending Review",
      };
    default:
      return {
        variant: "secondary" as const,
        className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
        icon: <Clock className="h-3 w-3 mr-1" />,
        label: "Unknown",
      };
  }
};

export default function TeamsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [userTeam, setUserTeam] = useState<TeamType | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [teamMembers, setTeamMembers] = useState<ExtendedMember[]>([]);
  const [teamTasks, setTeamTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Kiểm tra nếu user là team leader
  const isTeamLeader = userTeam && user && userTeam.leader.id === user.id;

  // Hàm xử lý tạo task
  const handleCreateTask = useCallback(
    async (task: Omit<TaskType, "id" | "created_at" | "updated_at">) => {
      try {
        const newTask = await createTask({
          name: task.name,
          description: task.description,
          deadline: task.deadline,
          status: task.status as
            | "pending"
            | "in_progress"
            | "completed"
            | "failed",
          assignedToId: task.assigned_to.id,
        });

        if (!newTask.id || !newTask.assigned_to.id) {
          throw new Error("Invalid task data.");
        }
        setTeamTasks((prevTasks) => [...prevTasks, newTask]);
      } catch (err: any) {
        setError(err.message || "Failed to create task.");
        toast.error(err.message || "Failed to create task.");
      }
    },
    []
  );

  // Hàm xử lý cập nhật trạng thái task
  const handleUpdateTaskStatus = useCallback(
    async (taskId: string, status: TaskType["status"]) => {
      try {
        const updatedTask = await updateTaskStatus(taskId, "completed");
        if (!updatedTask) {
          throw new Error("Failed to update task status.");
        }

        toast.success("Task status updated successfully!");
        setTeamTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status } : task
          )
        );
      } catch (err: any) {
        setError(err.message || "Failed to update task status.");
        toast.error(err.message || "Failed to update task status.");
      }
    },
    []
  );

  // Hàm tính toán thống kê đội nhóm
  const calculateTeamStats = useMemo(() => {
    const relevantTasks = teamTasks.filter((task) =>
      teamMembers.some((member) => member.user.id === task.assigned_to.id)
    );
    const totalTasks = relevantTasks.length;

    return {
      activeTasksCount: relevantTasks.filter(
        (task) => task.status === "pending" || task.status === "in_progress"
      ).length,
      completedTasksCount: relevantTasks.filter(
        (task) => task.status === "completed"
      ).length,
      pendingReviewTasksCount: relevantTasks.filter(
        (task) => task.status === "pending"
      ).length,
      failedTasksCount: relevantTasks.filter(
        (task) =>
          new Date(task.deadline) < new Date() && task.status !== "completed"
      ).length,
      completionRate:
        totalTasks > 0
          ? Math.round(
              (relevantTasks.filter((task) => task.status === "completed")
                .length /
                totalTasks) *
                100
            )
          : 0,
    };
  }, [teamTasks, teamMembers]);

  // Lọc members dựa trên search query
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(
      (member) =>
        searchQuery === "" ||
        `${member.user.first_name} ${member.user.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        member.employment_detail.position.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        member.employment_detail.department.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }, [teamMembers, searchQuery]);

  // Lọc tasks pending review
  const pendingReviewTasks = useMemo(() => {
    return teamTasks
      .filter(
        (task) =>
          task.status === "pending" &&
          teamMembers.some((member) => member.user.id === task.assigned_to.id)
      )
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
  }, [teamTasks, teamMembers]);

  // Sắp xếp tasks theo deadline
  const sortedTasks = useMemo(() => {
    return teamTasks
      .filter((task) =>
        teamMembers.some((member) => member.user.id === task.assigned_to.id)
      )
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
  }, [teamTasks, teamMembers]);

  // Lấy thông tin team của user
  const fetchUserTeams = useCallback(async () => {
    if (!user) {
      console.error("User not authenticated. Redirecting to login."); // Ghi log lỗi
      router.push("/login");
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const employmentResponse: EmploymentDetailResponse =
        await fetchEmploymentDetail(user.id);

      // Kiểm tra nếu không có thông tin team
      if (
        !employmentResponse.employment_detail ||
        !employmentResponse.employment_detail.team?.id
      ) {
        console.warn("User has not been assigned to any team."); // Ghi log cảnh báo
        setError("You have not been assigned to any team yet.");
        setUserTeam(null);
        setLoading(false);
        return;
      }

      const teamId = employmentResponse.employment_detail.team.id;
      const teamData = await getTeam(teamId);
      if (!teamData) {
        console.error("Failed to fetch team data for team ID:", teamId); // Ghi log lỗi
        throw new Error("Failed to load team data.");
      }

      setUserTeam(teamData);
    } catch (err: any) {
      console.error("Error fetching team data:", err); // Ghi log lỗi chi tiết
      const errorMessage = err.message.includes("Network")
        ? "Network error. Please check your connection."
        : err.message || "Failed to load team data.";
      setError(errorMessage);
      setUserTeam(null);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  // Lấy thông tin members và tasks của team
  const fetchTeamData = useCallback(async (teamId: string) => {
    try {
      setLoading(true);
      setError(null);

      const [teamData, tasksResponse] = await Promise.all([
        getTeam(teamId),
        fetchTeamTasks(teamId),
      ]);

      let extendedMembers: ExtendedMember[] = [];
      if (teamData?.members) {
        extendedMembers = await Promise.all(
          teamData.members.map(async (member) => {
            const userResponse = await fetchUserById(member.user.id);
            return {
              ...member,
              email: userResponse?.email || "N/A",
              phone_number: userResponse?.phoneNumber || "N/A",
            };
          })
        );
        setTeamMembers(extendedMembers);
      } else {
        setTeamMembers([]);
        setError("No members found in this team.");
      }

      setTeamTasks(tasksResponse.tasks || []);
    } catch (err: any) {
      console.error("Error fetching team data:", err); // Ghi log lỗi
      const errorMessage = err.message.includes("Network")
        ? "Network error. Please check your connection."
        : err.message || "Failed to load team data.";
      setError(errorMessage);
      setTeamMembers([]);
      setTeamTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi fetchUserTeams khi component mount
  useEffect(() => {
    fetchUserTeams();
  }, [fetchUserTeams]);

  // Gọi fetchTeamData khi có userTeam
  useEffect(() => {
    if (userTeam) {
      fetchTeamData(userTeam.id);
    }
  }, [userTeam, fetchTeamData]);

  // Giao diện khi đang tải
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight">My Teams</h1>
        <p className="text-muted-foreground mt-1">Loading...</p>
        <Card>
          <CardContent className="p-8 flex items-center justify-center">
            <div className="animate-pulse">
              <div className="rounded-full bg-background h-12 w-12 mb-4"></div>
              <div className="rounded-md bg-background h-6 w-48 mb-2"></div>
              <div className="rounded-md bg-background h-4 w-32"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Giao diện khi có lỗi
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight">My Teams</h1>
        <p className="text-muted-foreground mt-1">{error}</p>{" "}
        {/* Hiển thị thông báo lỗi cụ thể */}
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-center text-muted-foreground mb-6 max-w-md">
              {error === "You have not been assigned to any team yet."
                ? "You have not been assigned to any team yet."
                : error}
            </p>
            <Button onClick={() => fetchUserTeams()} className="cursor-pointer">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Giao diện khi không có team
  if (!userTeam) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight">My Teams</h1>
        <p className="text-muted-foreground mt-1">
          You are not currently a member of any team
        </p>
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Team Found</h2>
            <p className="text-center text-muted-foreground mb-6 max-w-md">
              You have not been assigned to any team yet. Please contact your
              administrator.
            </p>
            <Button onClick={() => router.push("/")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {userTeam && (
        <div className="space-y-6">
          <Card className="bg-background">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="/placeholder.svg" alt={userTeam.name} />
                    <AvatarFallback>
                      {userTeam.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{userTeam.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Users className="h-3 w-3 mr-1" />
                      {teamMembers.length} members • {teamTasks.length} tasks
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Team Chat
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">
                    {calculateTeamStats.activeTasksCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Tasks</p>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">
                    {calculateTeamStats.completionRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Completion Rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList
              className={cn(
                "grid mb-4",
                isTeamLeader ? "grid-cols-4" : "grid-cols-3"
              )}
            >
              <TabsTrigger value="overview" className="cursor-pointer">
                Overview
              </TabsTrigger>
              <TabsTrigger value="members" className="cursor-pointer">
                Members
              </TabsTrigger>
              <TabsTrigger value="tasks" className="cursor-pointer">
                Tasks
              </TabsTrigger>
              {isTeamLeader && (
                <TabsTrigger value="pending-review" className="cursor-pointer">
                  Pending Review
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle className="text-2xl">Team Overview</CardTitle>
                  <CardDescription>
                    Key information about the {userTeam.name} team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Team Leader</h3>
                      <div className="flex items-center mt-2">
                        <Avatar className="h-10 w-10 mr-2">
                          <AvatarImage
                            src="/placeholder.svg"
                            alt={userTeam.leader.first_name}
                          />
                          <AvatarFallback>
                            {userTeam.leader.first_name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {userTeam.leader.first_name}{" "}
                            {userTeam.leader.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {teamMembers.find(
                              (m) => m.user.id === userTeam.leader.id
                            )?.employment_detail.position.name || "Team Leader"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium">Team Statistics</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Total Members: {teamMembers.length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Active Tasks: {calculateTeamStats.activeTasksCount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Completed Tasks:{" "}
                        {calculateTeamStats.completedTasksCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <Card className="bg-background">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <CardTitle>Team Members</CardTitle>
                    <div className="relative w-full md:w-64 mt-2 md:mt-0">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search members..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                      <h3 className="mt-2 text-lg font-medium">
                        No Members Found
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchQuery
                          ? "No members match your search criteria"
                          : "This team has no members yet. Please contact your administrator."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMembers.map((member) => (
                        <div
                          key={member.user.id}
                          className="border rounded-lg p-4 flex flex-col"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage
                                  src="/placeholder.svg"
                                  alt={`${member.user.first_name} ${member.user.last_name}`}
                                />
                                <AvatarFallback>
                                  {member.user.first_name.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {member.user.first_name}{" "}
                                  {member.user.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {member.employment_detail.position.name}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            {member.email !== "N/A" && (
                              <div className="flex items-center text-xs">
                                <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                                <span>{member.email}</span>
                              </div>
                            )}
                            {member.phone_number !== "N/A" && (
                              <div className="flex items-center text-xs">
                                <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                                <span>{member.phone_number}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {member.employment_detail.position.name}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {member.employment_detail.department.name}
                            </Badge>
                          </div>

                          <div className="mt-auto pt-3 flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                              Joined {member.employment_detail.start_date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <Card className="bg-background">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <CardTitle>Team Tasks</CardTitle>
                      <CardDescription>
                        Tasks assigned to {userTeam.name} team members
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 md:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/tasks")}
                        className="cursor-pointer"
                      >
                        View Your Tasks
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isTeamLeader ? (
                    <CreateTaskCard
                      teamMembers={teamMembers}
                      onCreateTask={handleCreateTask}
                      className="mb-6"
                    />
                  ) : (
                    <></>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {calculateTeamStats.activeTasksCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {calculateTeamStats.completedTasksCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-amber-600">
                        {calculateTeamStats.pendingReviewTasksCount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pending Review
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {calculateTeamStats.failedTasksCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {sortedTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <h3 className="mt-2 text-lg font-medium">
                          No Tasks Found
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          This team has no assigned tasks yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {sortedTasks.map((task) => {
                          const assignedMember = teamMembers.find(
                            (member) => member.user.id === task.assigned_to.id
                          );
                          const now = new Date();
                          const isFailed =
                            new Date(task.deadline) < now &&
                            task.status !== "completed";
                          const daysUntilDeadline = Math.ceil(
                            (new Date(task.deadline).getTime() -
                              now.getTime()) /
                              (1000 * 60 * 60 * 24)
                          );
                          const statusBadge = getStatusBadge(task.status);

                          return (
                            <div
                              key={task.id}
                              className={cn(
                                "border rounded-lg p-4",
                                isFailed
                                  ? "border-red-200 bg-red-50 dark:bg-red-900/10"
                                  : statusBadge.className
                              )}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">{task.name}</h4>
                                    <Badge
                                      variant={statusBadge.variant}
                                      className={cn(
                                        "gap-1",
                                        statusBadge.className
                                      )}
                                    >
                                      {statusBadge.icon}
                                      {statusBadge.label}
                                    </Badge>
                                    {isFailed && (
                                      <Badge variant="destructive">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Failed
                                      </Badge>
                                    )}
                                  </div>

                                  <p className="text-sm text-muted-foreground mb-3">
                                    {task.description}
                                  </p>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      {assignedMember && (
                                        <div className="flex items-center gap-2">
                                          <Avatar className="h-6 w-6">
                                            <AvatarImage
                                              src="/placeholder.svg"
                                              alt={`${assignedMember.user.first_name} ${assignedMember.user.last_name}`}
                                            />
                                            <AvatarFallback>
                                              {assignedMember.user.first_name.substring(
                                                0,
                                                2
                                              )}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-sm">
                                            {assignedMember.user.first_name}{" "}
                                            {assignedMember.user.last_name}
                                          </span>
                                        </div>
                                      )}

                                      <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        <span
                                          className={
                                            isFailed
                                              ? "text-red-600 font-medium"
                                              : ""
                                          }
                                        >
                                          {new Date(
                                            task.deadline
                                          ).toLocaleDateString()}
                                          {!isFailed &&
                                            daysUntilDeadline >= 0 && (
                                              <span className="ml-1">
                                                (
                                                {daysUntilDeadline === 0
                                                  ? "Today"
                                                  : daysUntilDeadline === 1
                                                    ? "Tomorrow"
                                                    : `${daysUntilDeadline} days`}
                                                )
                                              </span>
                                            )}
                                        </span>
                                      </div>
                                    </div>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedTask(task);
                                        setIsDialogOpen(true);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      View Details
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {isTeamLeader && (
              <TabsContent value="pending-review" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Pending Review Tasks</CardTitle>
                    <CardDescription>
                      Review and mark tasks as complete for {userTeam.name} team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingReviewTasks.length === 0 ? (
                        <div className="text-center py-8">
                          <h3 className="mt-2 text-lg font-medium">
                            No Pending Review Tasks
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            There are no tasks pending review for this team.
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {pendingReviewTasks.map((task) => {
                            const assignedMember = teamMembers.find(
                              (member) => member.user.id === task.assigned_to.id
                            );
                            const statusBadge = getStatusBadge(task.status);

                            return (
                              <div
                                key={task.id}
                                className={cn(
                                  "border rounded-lg p-4",
                                  statusBadge.className
                                )}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-medium">
                                        {task.name}
                                      </h4>
                                      <Badge
                                        variant={statusBadge.variant}
                                        className={cn(
                                          "gap-1",
                                          statusBadge.className
                                        )}
                                      >
                                        {statusBadge.icon}
                                        {statusBadge.label}
                                      </Badge>
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-3">
                                      {task.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                        {assignedMember && (
                                          <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                              <AvatarImage
                                                src="/placeholder.svg"
                                                alt={`${assignedMember.user.first_name} ${assignedMember.user.last_name}`}
                                              />
                                              <AvatarFallback>
                                                {assignedMember.user.first_name.substring(
                                                  0,
                                                  2
                                                )}
                                              </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">
                                              {assignedMember.user.first_name}{" "}
                                              {assignedMember.user.last_name}
                                            </span>
                                          </div>
                                        )}

                                        <div className="flex items-center text-sm text-muted-foreground">
                                          <Calendar className="h-4 w-4 mr-1" />
                                          <span>
                                            {new Date(
                                              task.deadline
                                            ).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="default"
                                          size="sm"
                                          onClick={() =>
                                            handleUpdateTaskStatus(
                                              task.id,
                                              "completed"
                                            )
                                          }
                                          className="cursor-pointer"
                                        >
                                          Mark as Complete
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedTask(task);
                                            setIsDialogOpen(true);
                                          }}
                                          className="cursor-pointer"
                                        >
                                          View Details
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          <TaskViewDialog
            task={selectedTask}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </div>
      )}
    </div>
  );
}
