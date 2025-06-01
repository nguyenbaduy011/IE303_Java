"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ChevronDown,
  Download,
  Filter,
  Plus,
  Search,
  Settings,
  Users,
  UserPlus,
  Edit2,
  Crown,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { mockTeams, mockTeamMembers } from "@/lib/mock-team-data";

export default function AdminTeamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] =
    useState(false);
  const [isChangeLeaderDialogOpen, setIsChangeLeaderDialogOpen] =
    useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Filter teams based on search query and filters
  const filteredTeams = mockTeams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      departmentFilter === "all" || team.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = Array.from(
    new Set(mockTeams.map((team) => team.department))
  );

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
  };

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setIsEditTeamDialogOpen(true);
  };

  const handleAddMember = (team) => {
    setSelectedTeam(team);
    setIsAddMemberDialogOpen(true);
  };

  const handleRemoveMember = (team, member) => {
    setSelectedTeam(team);
    setMemberToRemove(member);
    setIsRemoveMemberDialogOpen(true);
  };

  const handleChangeLeader = (team) => {
    setSelectedTeam(team);
    setIsChangeLeaderDialogOpen(true);
  };

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
                View Performance Reports
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
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Teams Task Progress Overview</CardTitle>
            <CardDescription>
              Task completion progress across all teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  Task progress visualization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Distribution</CardTitle>
            <CardDescription>Teams by department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {departments.map((department) => {
              const teamsInDept = mockTeams.filter(
                (t) => t.department === department
              );
              const percentage = (teamsInDept.length / mockTeams.length) * 100;

              return (
                <div key={department} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{department}</span>
                    <span className="text-muted-foreground">
                      {teamsInDept.length} teams
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Teams</span>
                <span className="text-muted-foreground">
                  {mockTeams.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Members</span>
                <span className="text-muted-foreground">
                  {mockTeamMembers.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Avg Team Size</span>
                <span className="text-muted-foreground">
                  {Math.round(mockTeamMembers.length / mockTeams.length)}{" "}
                  members
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

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <TeamManagementCard
              key={team.id}
              team={team}
              onSelect={() => handleTeamSelect(team)}
              onEdit={() => handleEditTeam(team)}
              onAddMember={() => handleAddMember(team)}
              onRemoveMember={(member) => handleRemoveMember(team, member)}
              onChangeLeader={() => handleChangeLeader(team)}
            />
          ))}
        </div>
      </div>

      {/* Create Team Dialog */}
      <CreateTeamDialog
        isOpen={isCreateTeamDialogOpen}
        onClose={() => setIsCreateTeamDialogOpen(false)}
        departments={departments}
      />

      {/* Edit Team Dialog */}
      {selectedTeam && (
        <EditTeamDialog
          isOpen={isEditTeamDialogOpen}
          onClose={() => setIsEditTeamDialogOpen(false)}
          team={selectedTeam}
          departments={departments}
        />
      )}

      {/* Add Member Dialog */}
      {selectedTeam && (
        <AddMemberDialog
          isOpen={isAddMemberDialogOpen}
          onClose={() => setIsAddMemberDialogOpen(false)}
          team={selectedTeam}
        />
      )}

      {/* Remove Member Dialog */}
      {selectedTeam && memberToRemove && (
        <RemoveMemberDialog
          isOpen={isRemoveMemberDialogOpen}
          onClose={() => setIsRemoveMemberDialogOpen(false)}
          team={selectedTeam}
          member={memberToRemove}
        />
      )}

      {/* Change Leader Dialog */}
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

function TeamManagementCard({
  team,
  onSelect,
  onEdit,
  onAddMember,
  onRemoveMember,
  onChangeLeader,
}) {
  const teamMembers = mockTeamMembers.filter(
    (member) => member.teamId === team.id
  );
  const completionRate =
    Math.round((team.metrics.completedTasks / team.metrics.totalTasks) * 100) ||
    0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl">{team.name}</CardTitle>
            <CardDescription>{team.department}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Team Info
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onChangeLeader}>
                <Crown className="mr-2 h-4 w-4" />
                Change Leader
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onAddMember}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {team.description}
        </p>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Team Lead</span>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={team.lead?.avatar || "/placeholder.svg"}
                  alt={team.lead?.name || "Team Lead"}
                />
                <AvatarFallback>
                  {team.lead?.name?.charAt(0) || "L"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">
                {team.lead?.name || "Not assigned"}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Members</span>
            <span className="text-sm">{teamMembers.length} members</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Tasks</span>
            <span className="text-sm">
              {team.metrics?.completedTasks || 0}/
              {team.metrics?.totalTasks || 0}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span>{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          {/* Team Members Preview */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Team Members</span>
              <Button variant="ghost" size="sm" onClick={onAddMember}>
                <UserPlus className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {teamMembers.slice(0, 6).map((member) => (
                <div key={member.id} className="group relative">
                  <Avatar className="h-6 w-6 cursor-pointer">
                    <AvatarImage
                      src={member.avatar || "/placeholder.svg"}
                      alt={member.name}
                    />
                    <AvatarFallback className="text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {member.name}
                  </div>
                </div>
              ))}
              {teamMembers.length > 6 && (
                <div className="h-6 w-6 bg-muted rounded-full flex items-center justify-center text-xs">
                  +{teamMembers.length - 6}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <div className="p-4 pt-0 flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/teams/${team.id}`}>Manage Team</Link>
        </Button>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit2 className="mr-1 h-3 w-3" />
          Edit
        </Button>
      </div>
    </Card>
  );
}

function CreateTeamDialog({ isOpen, onClose, departments }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    leaderId: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Creating team:", formData);
    setFormData({
      name: "",
      description: "",
      department: "",
      leaderId: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Add a new team to your organization. Fill out the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter team name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter team description"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleChange("department", value)}
              required
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leader">Team Leader</Label>
            <Select
              value={formData.leaderId}
              onValueChange={(value) => handleChange("leaderId", value)}
              required
            >
              <SelectTrigger id="leader">
                <SelectValue placeholder="Select team leader" />
              </SelectTrigger>
              <SelectContent>
                {mockTeamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Team</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTeamDialog({ isOpen, onClose, team, departments }) {
  const [formData, setFormData] = useState({
    name: team.name || "",
    description: team.description || "",
    department: team.department || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updating team:", formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Team Information</DialogTitle>
          <DialogDescription>
            Update the details for {team.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Team Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleChange("department", value)}
              required
            >
              <SelectTrigger id="edit-department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddMemberDialog({ isOpen, onClose, team }) {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    email: "",
    position: "",
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  const currentTeamMembers = mockTeamMembers.filter(
    (member) => member.teamId === team.id
  );
  const availableMembers = mockTeamMembers.filter(
    (member) => !currentTeamMembers.some((tm) => tm.id === member.id)
  );

  const handleMemberToggle = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddExisting = () => {
    console.log(`Adding existing members to ${team.name}:`, selectedMembers);
    setSelectedMembers([]);
    onClose();
  };

  const handleAddNew = () => {
    console.log(`Adding new member to ${team.name}:`, newMemberForm);
    setNewMemberForm({ name: "", email: "", position: "" });
    setIsAddingNew(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Members to {team.name}</DialogTitle>
          <DialogDescription>
            Select existing members or add new ones to the team.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="existing" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing Members</TabsTrigger>
            <TabsTrigger value="new">Add New Member</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4">
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {availableMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No available members to add
                </p>
              ) : (
                availableMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-3 p-2 rounded-lg border"
                  >
                    <Checkbox
                      id={member.id}
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => handleMemberToggle(member.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={member.avatar || "/placeholder.svg"}
                        alt={member.name}
                      />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.position}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleAddExisting}
                disabled={selectedMembers.length === 0}
              >
                Add Selected ({selectedMembers.length})
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Full Name</Label>
                <Input
                  id="new-name"
                  value={newMemberForm.name}
                  onChange={(e) =>
                    setNewMemberForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newMemberForm.email}
                  onChange={(e) =>
                    setNewMemberForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="john.doe@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-position">Position</Label>
                <Input
                  id="new-position"
                  value={newMemberForm.position}
                  onChange={(e) =>
                    setNewMemberForm((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                  placeholder="Software Engineer"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleAddNew}
                disabled={
                  !newMemberForm.name ||
                  !newMemberForm.email ||
                  !newMemberForm.position
                }
              >
                Add New Member
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function RemoveMemberDialog({ isOpen, onClose, team, member }) {
  const handleRemove = () => {
    console.log(`Removing ${member.name} from ${team.name}`);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-medium">{member.name}</span> from the{" "}
            <span className="font-medium">{team.name}</span> team? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove Member
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ChangeLeaderDialog({ isOpen, onClose, team }) {
  const [selectedLeader, setSelectedLeader] = useState(team.lead?.name || "");
  const teamMembers = mockTeamMembers.filter(
    (member) => member.teamId === team.id
  );

  const handleChangeLeader = () => {
    console.log(`Changing leader of ${team.name} to ${selectedLeader}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Change Team Leader</DialogTitle>
          <DialogDescription>
            Select a new leader for {team.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Leader</Label>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={team.lead?.avatar || "/placeholder.svg"}
                  alt={team.lead?.name || "Team Lead"}
                />
                <AvatarFallback>
                  {team.lead?.name?.charAt(0) || "L"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {team.lead?.name || "Not assigned"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-leader">New Leader</Label>
            <Select value={selectedLeader} onValueChange={setSelectedLeader}>
              <SelectTrigger id="new-leader">
                <SelectValue placeholder="Select new leader" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.name}>
                    <div className="flex items-center gap-2">
                      <span>{member.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleChangeLeader}
            disabled={selectedLeader === (team.lead?.name || "")}
          >
            Change Leader
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
