"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  UserIcon,
  BriefcaseIcon,
  UsersIcon,
  BuildingIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react";

type EmployeeCardProps = {
  information: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    gender: string;
    nationality: string;
    phoneNumber: string;
    hireDate: string;
    address: string;
    image_url?: string;
  };
  employmentDetail: {
    position: {
      name: string;
      description?: string;
    };
    department: {
      name: string;
      description?: string;
    };
    team: {
      name: string;
    };
    working_status: string;
  };
};

export default function EnhancedEmployeeCard({
  information,
  employmentDetail,
}: EmployeeCardProps) {
  const fullName = `${information.firstName} ${information.lastName}`;
  const genderLabel = information.gender === "male" ? "Nam" : "Nữ";
  const isActive = employmentDetail.working_status === "active";

  const handleViewProfile = () => {
    console.log("Button clicked for profile:", information.id);
    window.open(`/profile/${information.id}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="w-full max-w-2xl shadow-md border border-border bg-card pointer-events-auto isolate">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Left side - Avatar and basic info */}
          <div className="flex-shrink-0">
            <div className="relative mb-3">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                {information.image_url && (
                  <AvatarImage
                    src={information.image_url || "/placeholder.svg"}
                    alt={fullName}
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {information.firstName[0]}
                  {information.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1">
                {isActive ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 bg-card rounded-full border border-border" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500 bg-card rounded-full border border-border" />
                )}
              </div>
            </div>
            <div className="text-center pointer-events-auto">
              <h2 className="text-lg font-bold text-foreground mb-1">
                {fullName}
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                {employmentDetail.position.name}
              </p>
              <Badge
                variant={isActive ? "default" : "destructive"}
                className={`text-xs ${isActive ? "bg-primary text-primary-foreground" : ""}`}
              >
                {isActive ? "Đang làm việc" : "Nghỉ việc"}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full text-xs h-7 border-primary/20 hover:bg-primary/5 hover:border-primary/40 cursor-pointer"
                onClick={handleViewProfile}
              >
                Xem hồ sơ
              </Button>
            </div>
          </div>

          <Separator orientation="vertical" className="h-auto" />

          {/* Right side - Information in columns */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Personal Information Column */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5 border-b border-border pb-1">
                <UserIcon className="h-3 w-3" />
                Cá nhân
              </h3>
              <div className="space-y-2">
                <InfoRow
                  icon={<CalendarIcon className="h-3 w-3" />}
                  label="Sinh"
                  value={information.birthDate}
                />
                <InfoRow
                  icon={<UserIcon className="h-3 w-3" />}
                  label="Giới tính"
                  value={genderLabel}
                />
                <InfoRow
                  icon={<MapPinIcon className="h-3 w-3" />}
                  label="Quốc tịch"
                  value={information.nationality}
                />
              </div>
            </div>

            {/* Contact Information Column */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5 border-b border-border pb-1">
                <PhoneIcon className="h-3 w-3" />
                Liên hệ
              </h3>
              <div className="space-y-2">
                <InfoRow
                  icon={<PhoneIcon className="h-3 w-3" />}
                  label="SĐT"
                  value={information.phoneNumber}
                  copyable
                />
                <InfoRow
                  icon={<MailIcon className="h-3 w-3" />}
                  label="Email"
                  value={information.email}
                  copyable
                />
                <InfoRow
                  icon={<MapPinIcon className="h-3 w-3" />}
                  label="Địa chỉ"
                  value={information.address}
                />
              </div>
            </div>

            {/* Employment Information Column */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5 border-b border-border pb-1">
                <BriefcaseIcon className="h-3 w-3" />
                Công việc
              </h3>
              <div className="space-y-2">
                <InfoRow
                  icon={<BuildingIcon className="h-3 w-3" />}
                  label="Phòng ban"
                  value={employmentDetail.department.name}
                />
                <InfoRow
                  icon={<UsersIcon className="h-3 w-3" />}
                  label="Team"
                  value={employmentDetail.team.name}
                />
                <InfoRow
                  icon={<CalendarIcon className="h-3 w-3" />}
                  label="Vào làm"
                  value={information.hireDate}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple info row component
function InfoRow({
  icon,
  label,
  value,
  copyable = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const handleCopy = () => {
    if (copyable) {
      navigator.clipboard.writeText(value);
    }
  };

  return (
    <div className="flex items-start gap-2 group">
      <div className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground font-medium">
          {label}:
        </div>
        <div
          className={`text-xs text-foreground font-medium leading-relaxed ${
            copyable
              ? "cursor-pointer hover:text-primary transition-colors"
              : ""
          }`}
          onClick={handleCopy}
          title={copyable ? "Click to copy" : undefined}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
