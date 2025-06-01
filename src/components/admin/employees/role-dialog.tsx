"use client";

import { useState, useEffect } from "react";
import {  Info } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { fetchUserById, UserType } from "@/api/get-user-information/route";
import { EmployeeType, PositionType } from "@/api/get-all-user(admin)/route";

// Hypothetical API to fetch all positions
const fetchPositions = async (): Promise<PositionType[]> => {
  try {
    const response = await fetch("http://localhost:8080/api/admin/positions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Session expired. Please log in again.");
      if (response.status === 403)
        throw new Error("You do not have permission to view positions.");
      throw new Error(`HTTP ${response.status}: Failed to fetch positions`);
    }

    const data = await response.json();
    return Array.isArray(data.positions) ? data.positions : [];
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch positions"
    );
  }
};

// Hypothetical API to update an employee's position
const updateEmployeePosition = async (
  employeeId: string,
  positionId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/admin/employees/${employeeId}/position`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ positionId }),
      }
    );

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Session expired. Please log in again.");
      if (response.status === 403)
        throw new Error("You do not have permission to update positions.");
      if (response.status === 404) throw new Error("Employee not found.");
      throw new Error(`HTTP ${response.status}: Failed to update position`);
    }
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update position"
    );
  }
};

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeType;
}

export function RoleDialog({ open, onOpenChange, employee }: RoleDialogProps) {
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [positions, setPositions] = useState<PositionType[]>([]);
  const [userInformation, setUserInformation] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected position when dialog opens
  useEffect(() => {
    if (employee && open) {
      setSelectedPosition(employee.position.id);
    }
  }, [employee, open]);

  // Fetch user information and positions
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch user information
        const userData = await fetchUserById(employee.user.id);
        setUserInformation(userData);

        // Fetch available positions
        const positionData = await fetchPositions();
        setPositions(positionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    if (open) {
      fetchData();
    }
  }, [employee, open]);

  const handleSubmit = async () => {
    if (!selectedPosition || selectedPosition === employee.position.id) return;

    try {
      await updateEmployeePosition(employee.id, selectedPosition);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update position"
      );
    }
  };

  const getFullName = (employee: EmployeeType) =>
    `${employee.user.first_name} ${employee.user.last_name}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Position</DialogTitle>
          <DialogDescription>
            Update position for this employee.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-4 text-center">Loading...</div>
        ) : error ? (
          <div className="py-4 text-center text-destructive">{error}</div>
        ) : (
          <>
            <div className="py-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {getFullName(employee)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{getFullName(employee)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {userInformation?.email || "No email available"}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Current Position</Label>
                  <span className="text-sm font-medium">
                    {employee.position.name}
                  </span>
                </div>

                <Label>Select New Position</Label>
                <RadioGroup
                  value={selectedPosition}
                  onValueChange={setSelectedPosition}
                  className="space-y-3"
                >
                  {positions.map((position) => (
                    <div
                      key={position.id}
                      className="flex items-start space-x-3 space-y-0"
                    >
                      <RadioGroupItem
                        value={position.id}
                        id={position.id}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5">
                        <Label
                          htmlFor={position.id}
                          className="font-medium cursor-pointer"
                        >
                          {position.name}
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          {position.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="bg-muted/50 p-3 rounded-md mt-6 flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">
                    Position Change Implications
                  </p>
                  <p>
                    Changing a user&apos;s position may affect their responsibilities
                    within the system. This action will be logged for audit
                    purposes.
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
                      disabled={
                        !selectedPosition ||
                        selectedPosition === employee.position.id
                      }
                    >
                      Update Position
                    </Button>
                  </TooltipTrigger>
                  {(!selectedPosition ||
                    selectedPosition === employee.position.id) && (
                    <TooltipContent>
                      <p>Please select a different position</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
