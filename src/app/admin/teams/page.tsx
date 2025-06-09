"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  ChevronDown,
  Download,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import {
  TeamWithLeaderType,
  fetchTeams,
} from "@/app/api/get-all-teams(admin)/route";
import { Member, TeamType, getTeam } from "@/app/api/get-team-member/route";
import { fetchTeamTasks, TaskType } from "@/app/api/get-team-task/route";
import { ChangeLeaderDialog } from "@/components/teams/change-leader-dialog";
import { TeamManagementCard } from "@/components/teams/team-management-card";
import { TaskProgressChart } from "@/components/teams/task-progress-chart";
import { EditTeamDialog } from "@/components/teams/edit-team-dialog";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";
import { RemoveMemberDialog } from "@/components/teams/remove-member-dialog";
import { AddMemberDialog } from "@/components/teams/add-member-dialog";

export default function AdminTeamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<TeamType | null>(null);
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] =
    useState(false);
  const [isChangeLeaderDialogOpen, setIsChangeLeaderDialogOpen] =
    useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [teams, setTeams] = useState<TeamWithLeaderType[]>([]);
  const [teamDetails, setTeamDetails] = useState<{ [key: string]: TeamType }>(
    {}
  );
  const [teamTasks, setTeamTasks] = useState<{ [key: string]: TaskType[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch teams and tasks on component mount
  useEffect(() => {
    const loadTeamsAndTasks = async () => {
      try {
        setLoading(true);
        const fetchedTeams = await fetchTeams();
        setTeams(fetchedTeams);

        const details: { [key: string]: TeamType } = {};
        const tasks: { [key: string]: TaskType[] } = {};
        for (const team of fetchedTeams) {
          const teamDetail = await getTeam(team.id);
          if (teamDetail) {
            details[team.id] = teamDetail;
          }
          const taskResponse = await fetchTeamTasks(team.id);
          tasks[team.id] = taskResponse.tasks;
        }
        setTeamDetails(details);
        setTeamTasks(tasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load teams");
      } finally {
        setLoading(false);
      }
    };
    loadTeamsAndTasks();
  }, []);

  // Filter teams based on search query
  const filteredTeams = teams.filter((team) => {
    const teamDetail = teamDetails[team.id];
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teamDetail?.members.some((member) =>
        `${member.user.first_name} ${member.user.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ) ||
      false;
    return matchesSearch;
  });

  // Calculate task completion for chart
  const taskCompletionData = teams.map((team) => {
    const tasks = teamTasks[team.id] || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;
    return {
      teamName: team.name,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  });

  const handleTeamSelect = async (team: TeamWithLeaderType) => {
    const teamDetail = teamDetails[team.id] || (await getTeam(team.id));
    if (teamDetail) {
      setTeamDetails((prev) => ({ ...prev, [team.id]: teamDetail }));
      setSelectedTeam(teamDetail);
    }
  };

  const handleEditTeam = async (team: TeamWithLeaderType) => {
    const teamDetail = teamDetails[team.id] || (await getTeam(team.id));
    if (teamDetail) {
      setTeamDetails((prev) => ({ ...prev, [team.id]: teamDetail }));
      setSelectedTeam(teamDetail);
      setIsEditTeamDialogOpen(true);
    }
  };

  const handleAddMember = async (team: TeamWithLeaderType) => {
    const teamDetail = teamDetails[team.id] || (await getTeam(team.id));
    if (teamDetail) {
      setTeamDetails((prev) => ({ ...prev, [team.id]: teamDetail }));
      setSelectedTeam(teamDetail);
      setIsAddMemberDialogOpen(true);
    }
  };

  const handleRemoveMember = async (
    team: TeamWithLeaderType,
    member: Member
  ) => {
    const teamDetail = teamDetails[team.id] || (await getTeam(team.id));
    if (teamDetail) {
      setTeamDetails((prev) => ({ ...prev, [team.id]: teamDetail }));
      setSelectedTeam(teamDetail);
      setMemberToRemove(member);
      setIsRemoveMemberDialogOpen(true);
    }
  };

  const handleMemberRemoved = async () => {
    if (selectedTeam && memberToRemove) {
      const updatedTeam: TeamType = {
        ...selectedTeam,
        members: selectedTeam.members.filter(
          (m) => m.user.id !== memberToRemove.user.id
        ),
        member_count: (selectedTeam.member_count || 0) - 1,
      };
      setTeamDetails((prev) => ({ ...prev, [selectedTeam.id]: updatedTeam }));
      setSelectedTeam(updatedTeam);
      setMemberToRemove(null);
      setIsRemoveMemberDialogOpen(false);
    }
  };

  const handleChangeLeader = async (team: TeamWithLeaderType) => {
    const teamDetail = teamDetails[team.id] || (await getTeam(team.id));
    if (teamDetail) {
      setTeamDetails((prev) => ({ ...prev, [team.id]: teamDetail }));
      setSelectedTeam(teamDetail);
      setIsChangeLeaderDialogOpen(true);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-destructive">{error}</div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage all teams across the organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateTeamDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Team Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Team Data
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Task Reports
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                Manage Team Roles
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskProgressChart completionData={taskCompletionData} />

        <Card>
          <CardHeader>
            <CardTitle>Team Statistics</CardTitle>
            <CardDescription>Overview of team stats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Teams</span>
                <span className="text-muted-foreground">{teams.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Members</span>
                <span className="text-muted">
                  {Object.values(teamDetails).reduce(
                    (sum, team) => sum + (team.member_count || 0),
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Avg Team Size</span>
                <span className="text-muted-foreground">
                  {teams.length
                    ? Math.round(
                        Object.values(teamDetails).reduce(
                          (sum, team) => sum + (team.member_count || 0),
                          0
                        ) / teams.length
                      )
                    : 0}{" "}
                  members
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Tasks</span>
                <span className="text-muted-foreground">
                  {Object.values(teamTasks).reduce(
                    (sum, tasks) => sum + tasks.length,
                    0
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              className="w-full md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <TeamManagementCard
              key={team.id}
              team={team}
              teamDetails={teamDetails[team.id]}
              tasks={teamTasks[team.id] || []}
              onSelect={() => handleTeamSelect(team)}
              onEdit={() => handleEditTeam(team)}
              onAddMember={() => handleAddMember(team)}
              onRemoveMember={(member) => handleRemoveMember(team, member)}
              onChangeLeader={() => handleChangeLeader(team)}
            />
          ))}
        </div>
      </div>

      <CreateTeamDialog
        isOpen={isCreateTeamDialogOpen}
        onClose={() => setIsCreateTeamDialogOpen(false)}

      />

      {selectedTeam && (
        <EditTeamDialog
          isOpen={isEditTeamDialogOpen}
          onClose={() => setIsEditTeamDialogOpen(false)}
          team={selectedTeam}
        />
      )}

      {selectedTeam && (
        <AddMemberDialog
          isOpen={isAddMemberDialogOpen}
          onClose={() => setIsAddMemberDialogOpen(false)}
          team={selectedTeam}
        />
      )}

      {selectedTeam && memberToRemove && (
        <RemoveMemberDialog
          isOpen={isRemoveMemberDialogOpen}
          onClose={() => {
            setIsRemoveMemberDialogOpen(false);
            setMemberToRemove(null);
          }}
          team={selectedTeam}
          member={memberToRemove}
          onMemberRemoved={handleMemberRemoved}
        />
      )}

      {selectedTeam && (
        <ChangeLeaderDialog
          isOpen={isChangeLeaderDialogOpen}
          onClose={() => setIsChangeLeaderDialogOpen(false)}
          team={selectedTeam}
        />
      )}
    </div>
  );
}
