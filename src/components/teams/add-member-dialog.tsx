/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  fetchUsersNotInAnyTeam,
  UserWithoutTeamType,
} from "@/app/api/get-users-not-in-team/route";
import { toast } from "sonner";
import { addEmployeeToTeam } from "@/app/api/add-member-to-team/route";
import { TeamWithLeaderType } from "@/app/api/get-all-teams(admin)/route";

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamWithLeaderType;
  onMemberAdded?: () => void; // Thêm prop để thông báo khi thêm thành viên thành công
}

export function AddMemberDialog({
  isOpen,
  onClose,
  team,
  onMemberAdded,
}: AddMemberDialogProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [availableMembers, setAvailableMembers] = useState<
    UserWithoutTeamType[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAvailableMembers = async () => {
      try {
        setIsLoading(true);
        const notInTeamUsers = await fetchUsersNotInAnyTeam();
        setAvailableMembers(notInTeamUsers || []); // Đảm bảo không set undefined
      } catch (error) {
        console.error("Error fetching available members:", error);
        toast.error("Failed to load available members");
        setAvailableMembers([]);
      } finally {
        setIsLoading(false);
      }
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
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member to add");
      return;
    }

    if (!team?.id) {
      toast.error("Team ID is missing");
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API cho từng member đã chọn
      for (const memberId of selectedMembers) {
        await addEmployeeToTeam(memberId, team.id);
      }
      toast.success(
        `Added ${selectedMembers.length} member(s) to team ${team?.name}`
      );
      setSelectedMembers([]);
      onClose();
      if (onMemberAdded) {
        onMemberAdded(); // Thông báo cho component cha để refresh dữ liệu
      }
    } catch (error: any) {
      console.error("Error adding members:", error);
      toast.error(error.message || "Failed to add members to team");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Members to {team?.name}</DialogTitle>
          <DialogDescription>
            Select existing members to add to the team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-4">
                Loading members...
              </p>
            ) : availableMembers.length === 0 ? (
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
                    disabled={isLoading}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={`${member.first_name} ${member.last_name}`}
                    />
                    <AvatarFallback>
                      {member.first_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {`${member.first_name} ${member.last_name}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleAddExisting}
              disabled={selectedMembers.length === 0 || isLoading}
            >
              {isLoading
                ? "Adding..."
                : `Add Selected (${selectedMembers.length})`}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
