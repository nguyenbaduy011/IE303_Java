import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

import { TeamWithLeaderType } from "@/app/api/get-all-teams(admin)/route";
import { Member, TeamType } from "@/app/api/get-team-member/route";
import { TaskType } from "@/app/api/get-team-task/route";
import { Crown, Edit2, Settings, UserPlus, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { deleteTeam } from "@/app/api/delete-team/route"; // Thay bằng đường dẫn thực tế đến file chứa API
import { toast } from "sonner";
// Định nghĩa props cho component
export function TeamManagementCard({
  team,
  teamDetails,
  tasks,
  onEdit,
  onAddMember,
  onRemoveMember,
  onChangeLeader,
}: {
  team: TeamWithLeaderType;
  teamDetails?: TeamType;
  tasks: TaskType[];
  onSelect: () => void;
  onEdit: () => void;
  onAddMember: () => void;
  onRemoveMember: (member: Member) => void;
  onChangeLeader: () => void;
}) {
  // State để quản lý trạng thái mở AlertDialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Lấy danh sách thành viên
  const teamMembers = teamDetails?.members || [];
  // Tính tổng số task
  const totalTasks = tasks.length;
  // Tính số task đã hoàn thành
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  // Tính tỷ lệ hoàn thành
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-xl">{team.name}</CardTitle>
              <CardDescription>{teamMembers.length} members</CardDescription>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            No description available
          </p>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Team Lead</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src="/placeholder.svg"
                    alt={`${team.leader.first_name} ${team.leader.last_name}`}
                  />
                  <AvatarFallback>
                    {team.leader.first_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {`${team.leader.first_name} ${team.leader.last_name}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Members</span>
              <span className="text-sm">
                {teamDetails?.member_count || 0} members
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tasks</span>
              <span className="text-sm">{totalTasks} tasks</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Task Progress</span>
                <span>{completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Team Members</span>
                <Button variant="ghost" size="sm" onClick={onAddMember}>
                  <UserPlus className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {teamMembers.slice(0, 6).map((member) => (
                  <div key={member.user.id} className="group relative">
                    <Avatar
                      className="h-6 w-6 cursor-pointer"
                      onClick={() => onRemoveMember(member)}
                    >
                      <AvatarImage
                        src="/placeholder.svg"
                        alt={`${member.user.first_name} ${member.user.last_name}`}
                      />
                      <AvatarFallback>
                        {member.user.first_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {`${member.user.first_name} ${member.user.last_name}`}
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
        <div className="p-4 pt-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/teams/${team.id}`}>Manage Team</Link>
          </Button>
        </div>
      </Card>

      {/* AlertDialog để xác nhận xóa team */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              team &quot;{team.name}&quot; and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await deleteTeam(team.id); // Gọi API xóa team
                  setIsDeleteDialogOpen(false);
                  window.location.reload();
                } catch (error) {
                  console.error("Failed to delete team:", error);
                  toast.error("Failed to delete team. Please try again.");
                }
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
