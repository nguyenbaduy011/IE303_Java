"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Edit, MoreHorizontal, UserPlus } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { DonutChart } from "@/components/donut-chart";

import { mockTeams, mockTeamMembers } from "@/lib/mock-team-data";

export default function TeamDetailsPage({ params }) {
  const teamId = params.id;
  const team = mockTeams.find((t) => t.id === teamId);
  const teamMembers = mockTeamMembers.filter(
    (member) => member.teamId === teamId
  );

  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] =
    useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    email: "",
    position: "",
    role: "member",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [teamName, setTeamName] = useState(team.name);
  const [teamDescription, setTeamDescription] = useState(team.description);
  const [teamDepartment, setTeamDepartment] = useState(team.department);
  const [teamLead, setTeamLead] = useState(team.lead.name);
  const [teamStatus, setTeamStatus] = useState(team.status);

  const handleFormChange = (field, value) => {
    setNewMemberForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddMember = () => {
    const errors = {};
    if (!newMemberForm.name.trim()) errors.name = "Name is required";
    if (!newMemberForm.email.trim()) errors.email = "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(newMemberForm.email))
      errors.email = "Valid email is required";
    if (!newMemberForm.position.trim())
      errors.position = "Position is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newMemberId = `member-${Date.now()}`;
    const newMember = {
      id: newMemberId,
      teamId: team.id,
      name: newMemberForm.name,
      position: newMemberForm.position,
      email: newMemberForm.email,
      phone: "+1 (555) 000-0000",
      avatar: "/placeholder.svg?height=40&width=40",
      joinDate: new Date().toLocaleDateString(),
      skills: [newMemberForm.position],
    };

    console.log(`Adding new member to team: ${team.name}`, newMember);

    setNewMemberForm({
      name: "",
      email: "",
      position: "",
      role: "member",
      notes: "",
    });
    setFormErrors({});
    setIsAddMemberDialogOpen(false);

    alert(`${newMemberForm.name} has been added to the team`);
  };

  const handleRemoveMember = (member) => {
    setMemberToRemove(member);
    setIsRemoveMemberDialogOpen(true);
  };

  const confirmRemoveMember = () => {
    console.log(
      `Removing member: ${memberToRemove.name} from team: ${team.name}`
    );
    setIsRemoveMemberDialogOpen(false);
    setMemberToRemove(null);
  };

  const handleEditTeam = () => {
    const updatedTeam = {
      ...team,
      name: teamName,
      description: teamDescription,
      department: teamDepartment,
      lead: { ...team.lead, name: teamLead },
      status: teamStatus,
    };
    console.log(`Updating team: ${team.name}`, updatedTeam);
    setIsEditTeamDialogOpen(false);
    alert(`Team ${team.name} has been updated`);
  };

  if (!team) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Team Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The team you're looking for doesn't exist or has been removed.
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
              <Badge
                variant={teamStatus === "active" ? "default" : "secondary"}
              >
                {teamStatus === "active" ? "Active" : "Pending"}
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              {teamDepartment} • {teamMembers.length} members
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
            <CardDescription>{teamDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Projects
                  </div>
                  <div className="text-2xl font-bold">
                    {team.metrics.projects}
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Completion Rate
                  </div>
                  <div className="text-2xl font-bold">
                    {team.metrics.completion}%
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Satisfaction
                  </div>
                  <div className="text-2xl font-bold">
                    {team.metrics.satisfaction}/10
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Team Goals</h3>
                <ul className="space-y-2">
                  {team.goals.map((goal, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium mb-4">Team Performance</h3>
                  <DonutChart
                    completed={team.metrics.completedTasks}
                    total={team.metrics.totalTasks}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Total Tasks: {team.metrics.totalTasks}</div>
                  <div>Completed: {team.metrics.completedTasks}</div>
                  <div>Pending: {team.metrics.pendingTasks}</div>
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
                <AvatarImage
                  src={team.lead.avatar || "/placeholder.svg"}
                  alt={team.lead.name}
                />
                <AvatarFallback>{team.lead.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{teamLead}</h3>
                <p className="text-sm text-muted-foreground">
                  {team.lead.position}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Active Projects</h3>
              {team.projects.map((project) => (
                <Card key={project.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{project.name}</h4>
                      <Badge
                        variant={
                          project.status === "completed"
                            ? "default"
                            : project.status === "in-progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {project.status === "in-progress"
                          ? "In Progress"
                          : project.status === "planning"
                            ? "Planning"
                            : "Completed"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {project.description}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Deadline: {project.deadline}</span>
                      <span>{project.members.length} members</span>
                    </div>
                    <div className="flex -space-x-2 mt-2">
                      {project.members.map((member, i) => (
                        <Avatar
                          key={i}
                          className="h-6 w-6 border-2 border-background"
                        >
                          <AvatarImage
                            src={member.avatar || "/placeholder.svg"}
                            alt={member.name}
                          />
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="events">Upcoming Events</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({teamMembers.length})</CardTitle>
              <CardDescription>
                Manage all members of the {teamName} team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex justify-between items-center p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={member.avatar || "/placeholder.svg"}
                          alt={member.name}
                        />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {member.position}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-right">
                        <div>{member.email}</div>
                        <div className="text-muted-foreground">
                          Joined {member.joinDate}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit Role</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
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

        <TabsContent value="activity" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest actions and updates from the team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-lg border">
                    <Avatar>
                      <AvatarImage
                        src={activity.user.avatar || "/placeholder.svg"}
                        alt={activity.user.name}
                      />
                      <AvatarFallback>
                        {activity.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>
                        <span className="font-medium">
                          {activity.user.name}
                        </span>{" "}
                        {activity.action}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Scheduled meetings and events for the team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.upcomingEvents.map((event, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex justify-between text-sm mt-1">
                        <span>{event.date}</span>
                        <span>{event.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={isAddMemberDialogOpen}
        onOpenChange={setIsAddMemberDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to the {teamName} team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newMemberForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="John Doe"
                className={formErrors.name ? "border-destructive" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newMemberForm.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                placeholder="john.doe@example.com"
                className={formErrors.email ? "border-destructive" : ""}
              />
              {formErrors.email && (
                <p className="text-sm text-destructive">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={newMemberForm.position}
                onChange={(e) => handleFormChange("position", e.target.value)}
                placeholder="Software Engineer"
                className={formErrors.position ? "border-destructive" : ""}
              />
              {formErrors.position && (
                <p className="text-sm text-destructive">
                  {formErrors.position}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role in Team</Label>
              <Select
                value={newMemberForm.role}
                onValueChange={(value) => handleFormChange("role", value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Team Member</SelectItem>
                  <SelectItem value="admin">Team Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional information about this team member"
                rows={3}
                value={newMemberForm.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddMemberDialogOpen(false);
                setFormErrors({});
                setNewMemberForm({
                  name: "",
                  email: "",
                  position: "",
                  role: "member",
                  notes: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddMember}>Add to Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                value={teamDescription}
                rows={3}
                onChange={(e) => setTeamDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-department">Department</Label>
              <Select
                value={teamDepartment}
                onValueChange={(value) => setTeamDepartment(value)}
              >
                <SelectTrigger id="team-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
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
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-status">Status</Label>
              <Select
                value={teamStatus}
                onValueChange={(value) => setTeamStatus(value)}
              >
                <SelectTrigger id="team-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
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

      <AlertDialog
        open={isRemoveMemberDialogOpen}
        onOpenChange={setIsRemoveMemberDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove && (
                <>
                  Are you sure you want to remove{" "}
                  <span className="font-medium">{memberToRemove.name}</span>{" "}
                  from the {teamName} team? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
