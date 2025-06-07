/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

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
import { RotateCcwKey } from "lucide-react";
import { toast } from "sonner";
import { resetPassword } from "@/app/api/reset-password/route";
import { fetchUserById } from "@/app/api/get-user-information/route";
import { EmployeeType } from "@/app/api/get-all-user(admin)/route";
import { Button } from "@/components/ui/button";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeType;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  employee,
}: ResetPasswordDialogProps) {
  const handleResetPassword = async () => {
    try {
      const infor = await fetchUserById(employee.user.id);
      if (infor?.email) {
        const res = await resetPassword({ email: infor.email });
        if (res) {
          toast.success("Password reset successfully");
        } else {
          toast.error("Password reset failed");
        }
      } else {
        toast.error("User email not found");
      }
    } catch (error) {
      toast.error("Password reset failed");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will send a request to reset the
            password for {employee.user.first_name} {employee.user.last_name}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="cursor-pointer"
            onClick={handleResetPassword}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
