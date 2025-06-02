import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamType } from "@/app/api/get-team-member/route";

interface ChangeLeaderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamType;
}

export function ChangeLeaderDialog({
  isOpen,
  onClose,
  team,
}: ChangeLeaderDialogProps) {
  const [selectedLeader, setSelectedLeader] = useState<string>(
    team.leader ? `${team.leader.first_name} ${team.leader.last_name}` : ""
  );

  const handleChangeLeader = async () => {
    try {
      console.log(`Changing leader of ${team.name} to ${selectedLeader}`);
      onClose();
    } catch (error) {
      console.error("Error changing leader:", error);
    }
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
                  src="/placeholder.svg"
                  alt={`${team.leader.first_name} ${team.leader.last_name}`}
                />
                <AvatarFallback>
                  {team.leader.first_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {team.leader
                  ? `${team.leader.first_name} ${team.leader.last_name}`
                  : "Not assigned"}
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
                {team.members.map((member) => (
                  <SelectItem
                    key={member.user.id}
                    value={`${member.user.first_name} ${member.user.last_name}`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{`${member.user.first_name} ${member.user.last_name}`}</span>
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
            disabled={
              selectedLeader ===
              (team.leader
                ? `${team.leader.first_name} ${team.leader.last_name}`
                : "")
            }
          >
            Change Leader
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
