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

interface RemoveMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamType;
  member: Member;
}

export function RemoveMemberDialog({
  isOpen,
  onClose,
  team,
  member,
}: RemoveMemberDialogProps) {
  const handleRemove = async () => {
    try {
      console.log(
        `Removing ${member.user.first_name} ${member.user.last_name} from ${team.name}`
      );
      onClose();
    } catch (error) {
      console.error("Error removing member:", error);
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
