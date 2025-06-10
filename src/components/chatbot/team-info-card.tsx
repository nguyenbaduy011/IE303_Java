"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Crown,
  Building,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronRight,
  Hash,
} from "lucide-react";

interface TeamInfoCardProps {
  id: string;
  name: string;
  leader: {
    id: string;
    first_name: string;
    last_name: string;
  };
  member_count: number;
  members: Array<{
    user: {
      id: string;
      first_name: string;
      last_name: string;
    };
    employment_detail: {
      position: { id: string; name: string };
      team: { id: string; name: string };
      department: { id: string; name: string };
      working_status: string;
      start_date: string;
    };
  }>;
  append?: (message: any) => void;
}

export default function TeamInfoCard({
  id,
  name,
  leader,
  member_count,
  members,
  append,
}: TeamInfoCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "terminated":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <CheckCircle className="h-3 w-3" />;
      case "inactive":
      case "terminated":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const activeMembers = members.filter(
    (member) => member.employment_detail.working_status === "active"
  );
  const inactiveMembers = members.filter(
    (member) => member.employment_detail.working_status !== "active"
  );

  return (
    <Card className="w-full max-w-2xl shadow-lg border border-border bg-card isolate pt-0">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-primary-foreground">
                {name}
              </CardTitle>
              <p className="text-xs text-primary-100 flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Team ID: {id}
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-primary-foreground/20 text-primary-foreground border-0"
          >
            {member_count} thành viên
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Team Leader Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Team Leader
          </h3>
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(leader.first_name, leader.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {leader.first_name} {leader.last_name}
              </p>
              <p className="text-xs text-muted-foreground">ID: {leader.id}</p>
            </div>
            <Crown className="h-4 w-4 text-primary" />
          </div>
        </div>

        <Separator />

        {/* Team Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-accent/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-lg font-bold text-foreground">
                {activeMembers.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </div>
          <div className="text-center p-3 bg-accent/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-lg font-bold text-foreground">
                {inactiveMembers.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Không hoạt động</p>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
            <Users className="h-4 w-4" />
            Danh sách thành viên
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {members.map((member) => (
              <div
                key={member.user.id}
                className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
              >
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {getInitials(member.user.first_name, member.user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-foreground truncate">
                      {member.user.first_name} {member.user.last_name}
                    </p>
                    <Badge
                      variant={getStatusColor(
                        member.employment_detail.working_status
                      )}
                      className="text-xs flex items-center gap-1"
                    >
                      {getStatusIcon(member.employment_detail.working_status)}
                      {member.employment_detail.working_status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ID: {member.user.id}
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      <span>{member.employment_detail.position.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building className="h-3 w-3" />
                      <span>{member.employment_detail.department.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Bắt đầu:{" "}
                        {new Date(
                          member.employment_detail.start_date
                        ).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {append && (
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full hover:bg-primary/5 hover:border-primary/40 transition-colors"
              onClick={() =>
                append({
                  role: "user",
                  content: `Xem chi tiết thành viên của team ${name}`,
                })
              }
            >
              <span>Xem chi tiết hơn</span>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
