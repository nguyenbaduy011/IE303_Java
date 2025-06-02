import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Member, TeamType } from "@/app/api/get-team-member/route";
import { fetchUsersNotInAnyTeam } from "@/app/api/get-users-not-in-team/route";

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamType;
}

export function AddMemberDialog({
  isOpen,
  onClose,
  team,
}: AddMemberDialogProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchAvailableMembers = async () => {
      const notInTeamUsers = await fetchUsersNotInAnyTeam();
      setAvailableMembers([]);
    };
    if (isOpen) {
      fetchAvailableMembers();
    }
  }, [isOpen]);

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddExisting = async () => {
    try {
      console.log(`Adding existing members to ${team.name}:`, selectedMembers);
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error("Error adding members:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Members to {team.name}</DialogTitle>
          <DialogDescription>
            Select existing members to add to the team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {availableMembers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No available members to add
              </p>
            ) : (
              availableMembers.map((member) => (
                <div
                  key={member.user.id}
                  className="flex items-center space-x-3 p-2 rounded-lg border"
                >
                  <Checkbox
                    id={member.user.id}
                    checked={selectedMembers.includes(member.user.id)}
                    onCheckedChange={() => handleMemberToggle(member.user.id)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={`${member.user.first_name} ${member.user.last_name}`}
                    />
                    <AvatarFallback>
                      {member.user.first_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {`${member.user.first_name} ${member.user.last_name}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.employment_detail.position.name}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
