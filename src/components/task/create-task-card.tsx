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
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, User, FileText, Target } from "lucide-react";

interface CreateTaskCardProps {
  teamMembers: UserType[];
  onCreateTask: (
    task: Omit<TaskType, "id" | "created_at" | "updated_at">
  ) => void;
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
    priority: "medium" as "low" | "medium" | "high",
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = async () => {
    if (!newTask.name || !newTask.assigned_to || !newTask.deadline) {
      return;
    }

    setIsCreating(true);

    try {
      await onCreateTask({
        name: newTask.name,
        description: newTask.description || null,
        deadline: newTask.deadline,
        status: "pending",
        assigned_to: newTask.assigned_to,
      });

      // Reset form
      setNewTask({
        name: "",
        description: "",
        assigned_to: "",
        deadline: "",
        priority: "medium",
      });
      setIsExpanded(false);
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setNewTask({
      name: "",
      description: "",
      assigned_to: "",
      deadline: "",
      priority: "medium",
    });
    setIsExpanded(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

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
          <Badge
            variant="outline"
            className={getPriorityColor(newTask.priority)}
          >
            {newTask.priority.charAt(0).toUpperCase() +
              newTask.priority.slice(1)}{" "}
            Priority
          </Badge>
        </div>
        <CardDescription>
          Fill in the details below to create and assign a new task
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Task Name */}
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

        {/* Task Description */}
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

        {/* Assignment and Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        {member.first_name[0]}
                        {member.last_name[0]}
                      </div>
                      {member.first_name} {member.last_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Priority
            </Label>
            <Select
              value={newTask.priority}
              onValueChange={(value: "low" | "medium" | "high") =>
                setNewTask({ ...newTask, priority: value })
              }
            >
              <SelectTrigger
                id="priority"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Low Priority
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Medium Priority
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    High Priority
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
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

        {/* Action Buttons */}
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

        {/* Form Validation Helper */}
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
