/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createTeam, CreateTeamPayload } from "@/app/api/create-team/route";
import {
  fetchUsersNotInAnyTeam,
  UserWithoutTeamType,
} from "@/app/api/get-users-not-in-team/route";

// Định nghĩa props cho dialog
interface CreateTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Định nghĩa schema xác thực form
const teamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  leaderId: z.string().uuid("Invalid leader ID format"),
});

export function CreateTeamDialog({ isOpen, onClose }: CreateTeamDialogProps) {
  // State để lưu danh sách user không có team
  const [users, setUsers] = useState<UserWithoutTeamType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Khởi tạo form với schema và giá trị mặc định
  const form = useForm<CreateTeamPayload>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      leaderId: "",
    },
  });

  // State để quản lý trạng thái loading khi submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users không có team khi dialog mở
  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        setLoadingUsers(true);
        try {
          const usersList = await fetchUsersNotInAnyTeam();
          setUsers(usersList);
        } catch (error: any) {
          console.error("Lỗi khi lấy danh sách user:", error);
          toast.error(error.message || "Failed to load users without team");
        } finally {
          setLoadingUsers(false);
        }
      };
      loadUsers();
      form.reset(); // Reset form khi mở dialog
    }
  }, [isOpen, form]);

  // Xử lý submit form
  const onSubmit = async (data: CreateTeamPayload) => {
    setIsSubmitting(true);
    try {
      console.log("Payload gửi đi:", data);
      await createTeam(data);
      toast.success("Team created successfully!");
      form.reset();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi tạo team:", error);
      toast.error(error.message || "Failed to create team");
    } finally {
      setIsSubmitting(false);
    }
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            {/* Trường nhập tên team */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter team name"
                      disabled={isSubmitting || loadingUsers}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Trường chọn leader */}
            <FormField
              control={form.control}
              name="leaderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Leader *</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting || loadingUsers || !users.length}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingUsers
                              ? "Loading users..."
                              : "Select team leader"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {users.length === 0 && !loadingUsers && (
                          <SelectItem value="none" disabled>
                            No users available
                          </SelectItem>
                        )}
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {`${user.first_name} ${user.last_name} (${user.email})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || loadingUsers}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || loadingUsers}>
                {isSubmitting ? "Creating..." : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
