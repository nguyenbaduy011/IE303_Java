/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, User, FileText, Target } from "lucide-react";
import { Member } from "@/app/api/get-team-member/route";
import { TaskType } from "@/app/api/get-user-task/route";
import { toast } from "sonner";

interface CreateTaskCardProps {
  teamMembers: Member[];
  onCreateTask: (
    task: Omit<TaskType, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  className?: string;
}

export function CreateTaskCard({
  teamMembers,
  onCreateTask,
  className,
}: CreateTaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    assigned_to: "",
    deadline: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Hàm xử lý tạo task mới
  const handleCreateTask = async () => {
    if (!newTask.name || !newTask.assigned_to || !newTask.deadline) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const deadlineDate = new Date(newTask.deadline);
    if (isNaN(deadlineDate.getTime())) {
      toast.error("Invalid deadline date.");
      return;
    }

    setIsCreating(true);

    try {
      const deadlineISO = deadlineDate.toISOString();
      const assignedMember = teamMembers.find(
        (member) => member.user.id === newTask.assigned_to
      );
      if (!assignedMember) {
        toast.error("Assigned member not found.");
        setIsCreating(false);
        return;
      }
      await onCreateTask({
        name: newTask.name,
        description: newTask.description || "",
        deadline: deadlineISO,
        status: "in_progress",
        assigned_to: {
          id: assignedMember.user.id,
          first_name: assignedMember.user.first_name,
          last_name: assignedMember.user.last_name,
        },
      });

      toast.success("Task created successfully!");
      setNewTask({
        name: "",
        description: "",
        assigned_to: "",
        deadline: "",
      });
      setIsExpanded(false);
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error.message || "Failed to create task. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Hàm xử lý hủy tạo task
  const handleCancel = () => {
    setNewTask({
      name: "",
      description: "",
      assigned_to: "",
      deadline: "",
    });
    setIsExpanded(false);
  };

  // Kiểm tra tính hợp lệ của form
  const isFormValid = newTask.name && newTask.assigned_to && newTask.deadline;

  if (!isExpanded) {
    return (
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-md border-dashed border-2 border-muted-foreground/20 hover:border-primary/50 ${className}`}
        onClick={() => setIsExpanded(true)}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg mb-2">Create New Task</CardTitle>
          <CardDescription>
            Click to create and assign a new task to your team members
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all duration-200 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Create New Task</CardTitle>
          </div>
        </div>
        <CardDescription>
          Fill in the details below to create and assign a new task
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tên task */}
        <div className="space-y-2">
          <Label htmlFor="task-name" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Task Name
          </Label>
          <Input
            id="task-name"
            placeholder="Enter a clear, descriptive task name"
            value={newTask.name}
            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Mô tả task */}
        <div className="space-y-2">
          <Label htmlFor="task-description" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Description (Optional)
          </Label>
          <Textarea
            id="task-description"
            placeholder="Provide detailed instructions, requirements, or context for this task..."
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Phân công */}
        <div className="space-y-2">
          <Label htmlFor="assign-to" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Assign To
          </Label>
          <Select
            value={newTask.assigned_to}
            onValueChange={(value) =>
              setNewTask({ ...newTask, assigned_to: value })
            }
          >
            <SelectTrigger
              id="assign-to"
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            >
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((member) => (
                <SelectItem key={member.user.id} value={member.user.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                      {member.user.first_name[0]}
                      {member.user.last_name[0]}
                    </div>
                    {member.user.first_name} {member.user.last_name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <Label htmlFor="deadline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Deadline
          </Label>
          <Input
            id="deadline"
            type="date"
            value={newTask.deadline}
            onChange={(e) =>
              setNewTask({ ...newTask, deadline: e.target.value })
            }
            min={new Date().toISOString().split("T")[0]}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Nút hành động */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateTask}
            disabled={!isFormValid || isCreating}
            className="flex-1"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </>
            )}
          </Button>
        </div>

        {/* Trợ giúp xác thực form */}
        {!isFormValid && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="font-medium mb-1">Required fields:</p>
            <ul className="space-y-1">
              {!newTask.name && <li>• Task name</li>}
              {!newTask.assigned_to && <li>• Team member assignment</li>}
              {!newTask.deadline && <li>• Deadline date</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
