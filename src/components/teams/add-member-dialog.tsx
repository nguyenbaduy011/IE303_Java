"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserFullView, UpdateEmploymentPayload } from "@/types/teams-page";
import { addMemberSchema, AddMemberForm } from "@/lib/validations";
import { useState, useEffect } from "react";
import LoadingButton from "../ui/loading-button";

interface AddMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  onAddMember: (newMember: UserFullView) => void;
  setSuccessMessage: (message: string) => void;
  setShowSuccessAlert: (show: boolean) => void;
}

export function AddMemberDialog({
  isOpen,
  onOpenChange,
  teamId,
  onAddMember,
  setSuccessMessage,
  setShowSuccessAlert,
}: AddMemberDialogProps) {
  const [availableUsers, setAvailableUsers] = useState<UserFullView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AddMemberForm>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      user_id: "",
      message: "",
    },
  });

  // Lấy danh sách người dùng chưa thuộc đội nhóm
  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/users?not_in_team=${teamId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch available users");
        }
        const users: UserFullView[] = await response.json();
        setAvailableUsers(users);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("Failed to load available users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchAvailableUsers();
    }
  }, [isOpen, teamId]);

  const onSubmit = async (data: AddMemberForm) => {
    try {
      setError(null);
      setLoading(true);

      // Tìm người dùng được chọn
      const selectedUser = availableUsers.find(
        (user) => user.id === data.user_id
      );
      if (!selectedUser) {
        throw new Error("Selected user not found");
      }

      // Cập nhật employment_details để thêm vào đội nhóm
      const response = await fetch(
        `/api/employment-details/${selectedUser.employment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ team_id: teamId } as UpdateEmploymentPayload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add member to team");
      }

      // Lấy thông tin người dùng đã cập nhật
      const userResponse = await fetch(`/api/users/${data.user_id}`);
      if (!userResponse.ok) {
        throw new Error("Failed to fetch updated user data");
      }
      const updatedUser: UserFullView = await userResponse.json();

      // Cập nhật danh sách thành viên và hiển thị thông báo
      onAddMember(updatedUser);
      setSuccessMessage(
        `${updatedUser.first_name} ${updatedUser.last_name} has been added to the team`
      );
      setShowSuccessAlert(true);
      form.reset();
      onOpenChange(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to add member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Select a user to add to the team.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loading ? (
                        <SelectItem value="" disabled>
                          Loading users...
                        </SelectItem>
                      ) : availableUsers.length === 0 ? (
                        <SelectItem value="" disabled>
                          No users available
                        </SelectItem>
                      ) : (
                        availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} ({user.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="I'd like to invite you to join our team..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                disabled={loading || availableUsers.length === 0} loading={false}              >
                {loading ? "Adding..." : "Add to Team"}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
