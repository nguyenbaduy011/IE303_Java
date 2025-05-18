"use client";

import { useState, useEffect } from "react";
import { Check, Info } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mockRole } from "@/app/data/mock-data";
import { UserFullShape } from "@/types/types";
import { getInitials } from "@/utils/getInitials";
import { getFullName } from "@/utils/getFullName";

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: UserFullShape;
}

export function RoleDialog({ open, onOpenChange, employee }: RoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    if (employee) {
      setSelectedRole(employee.role?.name || "");
    }
  }, [employee, open]);

  const handleSubmit = () => {
    console.log(
      "Updating role for employee:",
      employee?.id,
      "to:",
      selectedRole
    );
    onOpenChange(false);
  };

  const roles = mockRole;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Role</DialogTitle>
          <DialogDescription>
            Update role and access level for this employee.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={employee?.image_url || "/placeholder.svg"}
                alt={getFullName(employee)}
              />
              <AvatarFallback>{getInitials(employee)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{getFullName(employee)}</h3>
              <p className="text-sm text-muted-foreground">{employee?.email}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Current Role</Label>
              <span className="text-sm font-medium">{employee.role.name}</span>
            </div>

            <Label>Select New Role</Label>
            <RadioGroup
              value={selectedRole}
              onValueChange={setSelectedRole}
              className="space-y-3"
            >
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-start space-x-3 space-y-0"
                >
                  <RadioGroupItem
                    value={role.name}
                    id={role.id}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor={role.id}
                      className="font-medium cursor-pointer"
                    >
                      {role.name}
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      {role.description}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {role.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center text-xs bg-muted px-2 py-1 rounded-md"
                        >
                          <Check className="h-3 w-3 mr-1 text-primary" />
                          {permission.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="bg-muted/50 p-3 rounded-md mt-6 flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Role Change Implications</p>
              <p>
                Changing a user&apos;s role will immediately affect their access
                permissions and capabilities within the system. This action will
                be logged for audit purposes.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedRole || selectedRole === employee?.role?.name}
                >
                  Update Role
                </Button>
              </TooltipTrigger>
              {(!selectedRole || selectedRole === employee?.role?.name) && (
                <TooltipContent>
                  <p>Please select a different role</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
