/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, MoreHorizontal, UserPlus } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTeam, Member, TeamType } from "@/app/api/get-team-member/route";
import { fetchTeamTasks, TaskType } from "@/app/api/get-team-task/route";
import { AddMemberDialog } from "@/components/teams/add-member-dialog";
import { DonutChart } from "@/components/teams/team-progress-donut-chart";
import { getFullName } from "@/utils/getFullName";
import { Badge } from "@/components/ui/badge";
import { RemoveMemberDialog } from "@/components/teams/remove-member-dialog";
import { updateTeam, UpdateTeamPayload } from "@/app/api/update-team/route";
import { toast } from "sonner";

export default function TeamDetailsPage() {
  const params = useParams();
  const teamId = params.id as string;
  const [team, setTeam] = useState<TeamType | null>(null);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] =
    useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamLead, setTeamLead] = useState("");

  // Function to fetch team and tasks data
  const refreshTeamData = async () => {
    try {
      setLoading(true);
      const [teamData, taskResponse] = await Promise.all([
        getTeam(teamId),
        fetchTeamTasks(teamId),
      ]);
      if (teamData) {
        setTeam(teamData);
        setTeamName(teamData.name);
        setTeamLead(
          teamData.leader
            ? `${teamData.leader.first_name} ${teamData.leader.last_name}`
            : "Not assigned"
        );
        setTasks(taskResponse.tasks);
      } else {
        setError("Team not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  // Fetch team and tasks on mount
  useEffect(() => {
    refreshTeamData();
  }, [teamId]);

  const handleEditTeam = async () => {
    try {
      // Find the selected leader's ID from team members
      const selectedLeader = team?.members.find(
        (member) =>
          `${member.user.first_name} ${member.user.last_name}` === teamLead
      );
      if (!teamName) {
        toast.error("Team name is required");
        return;
      }
      if (!selectedLeader) {
        toast.error("Please select a valid team lead");
        return;
      }

      // Construct payload for updateTeam
      const payload: UpdateTeamPayload = {
        name: teamName,
        leaderId: selectedLeader.user.id, // Use leaderId as per UpdateTeamPayload
      };

      // Call updateTeam API with teamId and payload
      await updateTeam(teamId, payload);

      // Refresh data after update
      await refreshTeamData();
      setIsEditTeamDialogOpen(false);
      toast.success(`Team ${teamName} has been updated successfully`);
    } catch (error: any) {
      console.error("Error updating team:", error);
      toast.error(error.message || "Failed to update team");
    }
  };

  const handleRemoveMember = (member: Member) => {
    setMemberToRemove(member);
    setIsRemoveMemberDialogOpen(true);
  };

  const handleMemberRemoved = () => {
    if (team && memberToRemove) {
      const updatedTeam: TeamType = {
        ...team,
        members: team.members.filter(
          (m) => m.user.id !== memberToRemove.user.id
        ),
        member_count: (team.member_count || 0) - 1,
      };
      setTeam(updatedTeam);
      setMemberToRemove(null);
      setIsRemoveMemberDialogOpen(false);
    }
  };

  // Calculate task metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (error || !team) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Team Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error ||
            "The team you're looking for doesn't exist or has been removed."}
        </p>
        <Button asChild>
          <Link href="/admin/teams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/teams">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              {teamName}
            </h1>
            <p className="text-muted-foreground">
              {team.members.length} members
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddMemberDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditTeamDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Team
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Tasks
                  </div>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Completion Rate
                  </div>
                  <div className="text-2xl font-bold">
                    {completionRate.toFixed(1)}%
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Team Goals</h3>
                <p className="text-sm text-muted-foreground">
                  No goals available
                </p>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium mb-4">Team Performance</h3>
                  <DonutChart completed={completedTasks} total={totalTasks} />
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Total Tasks: {totalTasks}</div>
                  <div>Completed: {completedTasks}</div>
                  <div>Pending: {totalTasks - completedTasks}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg" alt={teamLead} />
                <AvatarFallback>{teamLead.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{teamLead}</h3>
                <p className="text-sm text-muted-foreground">Team Lead</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Active Tasks</h3>
              <p className="text-sm text-muted-foreground">
                {totalTasks > 0
                  ? `${totalTasks} tasks in progress`
                  : "No tasks available"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({team.members.length})</CardTitle>
              <CardDescription>
                Manage all members of the {teamName} team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.members.map((member) => (
                  <div
                    key={member.user.id}
                    className="flex justify-between items-center p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src="/placeholder.svg"
                          alt={getFullName(
                            member.user.first_name,
                            member.user.last_name
                          )}
                        />
                        <AvatarFallback>
                          {member.user.first_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {getFullName(
                              member.user.first_name,
                              member.user.last_name
                            )}
                          </h4>
                          {team.leader.id === member.user.id && (
                            <Badge>Leader</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.employment_detail.position.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-right">
                        <div className="text-muted-foreground">
                          Joined {member.employment_detail.start_date}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">
                            <Link href={`/profile/${member.user.id}`}>
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive cursor-pointer"
                            onClick={() => handleRemoveMember(member)}
                          >
                            Remove from Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddMemberDialog
        isOpen={isAddMemberDialogOpen}
        onClose={() => setIsAddMemberDialogOpen(false)}
        team={team}
      />

      <Dialog
        open={isEditTeamDialogOpen}
        onOpenChange={setIsEditTeamDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update the details for {teamName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-lead">Team Lead</Label>
              <Select
                value={teamLead}
                onValueChange={(value) => setTeamLead(value)}
              >
                <SelectTrigger id="team-lead">
                  <SelectValue placeholder="Select team lead" />
                </SelectTrigger>
                <SelectContent>
                  {team.members.map((member) => (
                    <SelectItem
                      key={member.user.id}
                      value={`${member.user.first_name} ${member.user.last_name}`}
                    >
                      {`${member.user.first_name} ${member.user.last_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditTeamDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditTeam}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {team && memberToRemove && (
        <RemoveMemberDialog
          isOpen={isRemoveMemberDialogOpen}
          onClose={() => {
            setIsRemoveMemberDialogOpen(false);
            setMemberToRemove(null);
          }}
          team={team}
          member={memberToRemove}
          onMemberRemoved={handleMemberRemoved}
        />
      )}
    </div>
  );
}
