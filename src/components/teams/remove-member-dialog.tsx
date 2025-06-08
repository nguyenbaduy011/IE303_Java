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
import { Member, TeamType } from "@/app/api/get-team-member/route";
import { removeEmployeeFromTeam } from "@/app/api/delete-user-from-team/route";
import { toast } from "sonner";

interface RemoveMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamType;
  member: Member;
  onMemberRemoved?: () => void; // Callback để thông báo khi xóa thành công
}

export function RemoveMemberDialog({
  isOpen,
  onClose,
  team,
  member,
  onMemberRemoved,
}: RemoveMemberDialogProps) {
  const handleRemove = async () => {
    try {
      const success = await removeEmployeeFromTeam(member.user.id);
      if (success) {
        console.log(
          `Successfully removed ${member.user.first_name} ${member.user.last_name} from ${team.name}`
        );
        toast.success(
          `Successfully removed ${member.user.first_name} ${member.user.last_name} from ${team.name}`
        );
        onMemberRemoved?.(); // Gọi callback để cập nhật state ở component cha
        onClose();
      } else {
        console.error("Failed to remove member: API returned false");
        toast.error("Failed to remove member from team");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("An error occurred while removing the member");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-medium">{`${member.user.first_name} ${member.user.last_name}`}</span>{" "}
            from the <span className="font-medium">{team.name}</span> team? This
            action cannot be undone.
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
