"use client";

import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Search,
  Users,
  Calendar,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  ListTodo,
  CheckCircle,
  MoreHorizontal,
  UserMinus,
  UserCheck,
} from "lucide-react";
import { AddMemberDialog } from "@/components/teams/add-member-dialog";
import {
  TeamView,
  UserFullView,
  EmploymentDetailView,
  UpdateEmploymentPayload,
} from "@/types/teams-page";

// Mock current user data (giả định từ auth context hoặc API)
const currentUser: UserFullView = {
  id: "member-1",
  first_name: "Alex",
  last_name: "Morgan",
  email: "alex.morgan@socius.com",
  phone_number: "+1 (555) 123-4567",
  image_url: "/placeholder.svg?height=40&width=40",
  hire_date: "2023-01-01",
  employment: {
    id: "emp-1",
    user_id: "member-1",
    team_id: "team-1",
    position_id: "pos-1",
    department_id: "dept-1",
  },
  position: { id: "pos-1", name: "Software Engineer" },
  department: { id: "dept-1", name: "Engineering" },
};

export default function TeamsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [userTeams, setUserTeams] = useState<TeamView[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamView | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [teamMembers, setTeamMembers] = useState<UserFullView[]>([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isRemoveMemberOpen, setIsRemoveMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<UserFullView | null>(
    null
  );
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách đội nhóm và thành viên
  useEffect(() => {
    const fetchUserTeams = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy employment_details của người dùng
        const employmentResponse = await fetch(
          `/api/employment-details?user_id=${currentUser.id}`
        );
        if (!employmentResponse.ok) {
          throw new Error("Failed to fetch employment details");
        }
        const userEmployments: EmploymentDetailView[] =
          await employmentResponse.json();

        // Lấy danh sách team_id duy nhất
        const teamIds = [
          ...new Set(
            userEmployments
              .map((employment) => employment.team_id)
              .filter((id): id is string => id !== null && id !== undefined)
          ),
        ];

        // Lấy danh sách đội nhóm
        const teamsResponse = await fetch("/api/teams");
        if (!teamsResponse.ok) {
          throw new Error("Failed to fetch teams");
        }
        const teams: TeamView[] = await teamsResponse.json();

        // Lọc các đội nhóm mà người dùng là thành viên
        const userTeams = teams.filter((team) => teamIds.includes(team.id));
        setUserTeams(userTeams);

        // Nếu có đội nhóm, chọn đội nhóm đầu tiên và lấy thành viên
        if (userTeams.length > 0) {
          setSelectedTeam(userTeams[0]);
          const membersResponse = await fetch(
            `/api/users?team_id=${userTeams[0].id}`
          );
          if (!membersResponse.ok) {
            throw new Error("Failed to fetch team members");
          }
          const members: UserFullView[] = await membersResponse.json();
          setTeamMembers(members);
        } else {
          setSelectedTeam(null);
          setTeamMembers([]);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("Failed to load team data. Please try again later.");
        setUserTeams([]);
        setSelectedTeam(null);
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTeams();
  }, []);

  // Cập nhật thành viên khi đội nhóm thay đổi
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (selectedTeam) {
        try {
          const response = await fetch(`/api/users?team_id=${selectedTeam.id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch team members");
          }
          const members: UserFullView[] = await response.json();
          setTeamMembers(members);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          setError("Failed to load team members.");
          setTeamMembers([]);
        }
      }
    };

    fetchTeamMembers();
  }, [selectedTeam]);

  // Lọc thành viên dựa trên tìm kiếm
  const filteredMembers = teamMembers.filter(
    (member) =>
      searchQuery === "" ||
      `${member.first_name} ${member.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      member.position.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Xóa thành viên khỏi đội nhóm
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      const response = await fetch(
        `/api/employment-details/${memberToRemove.employment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ team_id: null } as UpdateEmploymentPayload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove member from team");
      }

      // Cập nhật danh sách thành viên
      setTeamMembers(
        teamMembers.filter((member) => member.id !== memberToRemove.id)
      );
      setSuccessMessage(
        `${memberToRemove.first_name} ${memberToRemove.last_name} has been removed from the team`
      );
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 5000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to remove member. Please try again.");
    } finally {
      setMemberToRemove(null);
      setIsRemoveMemberOpen(false);
    }
  };

  const navigateToTasks = () => {
    if (selectedTeam) {
      router.push(`/tasks?team=${selectedTeam.id}`);
    }
  };

  const isTeamLeader =
    selectedTeam && selectedTeam.leader_id === currentUser.id;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Teams</h1>
            <p className="text-muted-foreground mt-1">
              Loading your team information...
            </p>
          </div>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-8 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-pulse rounded-full bg-muted h-12 w-12 mb-4"></div>
                <div className="animate-pulse rounded-md bg-muted h-6 w-48 mb-2"></div>
                <div className="animate-pulse rounded-md bg-muted h-4 w-32"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Teams</h1>
            <p className="text-muted-foreground mt-1">
              Error loading team data
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-center text-muted-foreground mb-6 max-w-md">
              {error}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userTeams.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Teams</h1>
            <p className="text-muted-foreground mt-1">
              You are not currently a member of any team
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Team Found</h2>
            <p className="text-center text-muted-foreground mb-6 max-w-md">
              You are not currently assigned to any team. Please contact your
              administrator if you believe this is an error.
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
      {showSuccessAlert && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Teams</h1>
          <p className="text-muted-foreground mt-1">
            {userTeams.length > 1
              ? `You are a member of ${userTeams.length} teams`
              : `${selectedTeam?.name}`}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          {userTeams.length > 1 && (
            <Select
              value={selectedTeam?.id}
              onValueChange={(value) => {
                const team = userTeams.find((t) => t.id === value);
                setSelectedTeam(team || null);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {userTeams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button size="sm" onClick={navigateToTasks}>
            <ListTodo className="h-4 w-4 mr-2" />
            Tasks
          </Button>
        </div>
      </div>

      {selectedTeam && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={selectedTeam.name}
                    />
                    <AvatarFallback>
                      {selectedTeam.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedTeam.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Users className="h-3 w-3 mr-1" />
                      {teamMembers.length} members
                    </CardDescription>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 md:mt-0">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Team Chat
                  </Button>
                  {isTeamLeader && (
                    <AddMemberDialog
                      isOpen={isAddMemberOpen}
                      onOpenChange={setIsAddMemberOpen}
                      teamId={selectedTeam.id}
                      onAddMember={(newMember: UserFullView) =>
                        setTeamMembers([...teamMembers, newMember])
                      }
                      setSuccessMessage={setSuccessMessage}
                      setShowSuccessAlert={setShowSuccessAlert}
                    />
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Overview</CardTitle>
                  <CardDescription>
                    Key information about the {selectedTeam.name} team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Team Lead</h3>
                      <div className="flex items-center mt-2">
                        <Avatar className="h-10 w-10 mr-2">
                          <AvatarImage
                            src={
                              teamMembers.find(
                                (m) => m.id === selectedTeam.leader_id
                              )?.image_url || "/placeholder.svg"
                            }
                            alt={
                              teamMembers.find(
                                (m) => m.id === selectedTeam.leader_id
                              )?.first_name || "Team Lead"
                            }
                          />
                          <AvatarFallback>
                            {teamMembers
                              .find((m) => m.id === selectedTeam.leader_id)
                              ?.first_name?.substring(0, 2) || "TL"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {teamMembers.find(
                              (m) => m.id === selectedTeam.leader_id
                            )?.first_name || "Not assigned"}{" "}
                            {
                              teamMembers.find(
                                (m) => m.id === selectedTeam.leader_id
                              )?.last_name
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {teamMembers.find(
                              (m) => m.id === selectedTeam.leader_id
                            )?.position.name || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium">Team Goals</h3>
                      <ul className="mt-2 space-y-2">
                        {[
                          "Complete project milestones",
                          "Enhance team collaboration",
                          "Meet deadlines",
                        ].map((goal, i) => (
                          <li key={i} className="text-sm flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <CardTitle>Team Members</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative w-full md:w-64 mt-2 md:mt-0">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search members..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      {isTeamLeader && (
                        <Button
                          size="sm"
                          className="mt-2 md:mt-0"
                          onClick={() => setIsAddMemberOpen(true)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      )}
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
                          : "This team doesn't have any members yet"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMembers.map((member) => (
                        <div
                          key={member.id}
                          className="border rounded-lg p-4 flex flex-col"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage
                                  src={member.image_url || "/placeholder.svg"}
                                  alt={`${member.first_name} ${member.last_name}`}
                                />
                                <AvatarFallback>
                                  {member.first_name.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {member.first_name} {member.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {member.position.name}
                                </p>
                              </div>
                            </div>
                            {isTeamLeader && member.id !== currentUser.id && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56" align="end">
                                  <div className="grid gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="justify-start"
                                    >
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      View Profile
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="justify-start"
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Message
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="justify-start"
                                    >
                                      <Mail className="h-4 w-4 mr-2" />
                                      Email
                                    </Button>
                                    <Separator className="my-1" />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="justify-start text-destructive hover:text-destructive"
                                      onClick={() => {
                                        setMemberToRemove(member);
                                        setIsRemoveMemberOpen(true);
                                      }}
                                    >
                                      <UserMinus className="h-4 w-4 mr-2" />
                                      Remove from Team
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center text-xs">
                              <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center text-xs">
                              <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                              <span>{member.phone_number || "N/A"}</span>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {member.position.name}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {member.department.name}
                            </Badge>
                          </div>

                          <div className="mt-auto pt-3 flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                              Joined {member.hire_date}
                            </p>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Dialog
            open={isRemoveMemberOpen}
            onOpenChange={setIsRemoveMemberOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Remove Team Member</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove this member from the team?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {memberToRemove && (
                <div className="py-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={memberToRemove.image_url || "/placeholder.svg"}
                        alt={`${memberToRemove.first_name} ${memberToRemove.last_name}`}
                      />
                      <AvatarFallback>
                        {memberToRemove.first_name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {memberToRemove.first_name} {memberToRemove.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {memberToRemove.position.name}
                      </p>
                    </div>
                  </div>
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      This will remove the member from all team resources.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsRemoveMemberOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleRemoveMember}>
                  Remove Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
