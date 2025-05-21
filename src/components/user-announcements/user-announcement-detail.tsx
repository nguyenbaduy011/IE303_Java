"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertTriangle,
  Award,
  Bell,
  Calendar,
  CheckSquare,
  Clock,
  Gift,
  MessageSquare,
  Server,
} from "lucide-react";
import { NotificationType, UserType, NotiType } from "@/types/types";
import { getInitials } from "@/utils/getInitials";

interface UserAnnouncementDetailProps {
  id: string;
}

interface Announcement {
  notification: NotificationType;
  sender: UserType;
}

export function UserAnnouncementDetail({ id }: UserAnnouncementDetailProps) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setError(null);
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`/api/notifications/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized: Please log in again");
          }
          throw new Error("Failed to fetch announcement");
        }

        const data = await response.json();
        setAnnouncement({
          notification: {
            id: data.id,
            title: data.title,
            sender_id: data.sender_id,
            message: data.message,
            expiry_date: data.expiry_date,
            type: data.type,
            is_urgent: data.is_urgent,
            created_at: new Date(data.created_at).toLocaleDateString(),
            updated_at: data.updated_at,
          },
          sender: {
            id: data.sender.id,
            first_name: data.sender.first_name,
            last_name: data.sender.last_name,
            email: data.sender.email,
            birth_date: data.sender.birth_date,
            image_url: data.sender.image_url || null,
            gender: data.sender.gender,
            nationality: data.sender.nationality || null,
            phone_number: data.sender.phone_number || null,
            hire_date: data.sender.hire_date,
            address: data.sender.address || null,
            created_at: data.sender.created_at,
            updated_at: data.sender.updated_at,
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(
          err.message || "Failed to load announcement. Please try again later."
        );
        setAnnouncement(null);
      }
    };

    fetchAnnouncement();
  }, [id]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="mb-4 text-lg font-semibold text-destructive">
              {error}
            </p>
            <p className="text-muted-foreground">
              The announcement you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!announcement) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="mb-4 text-lg font-semibold">Announcement not found</p>
            <p className="text-muted-foreground">
              The announcement you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBadgeProps = (type: NotiType) => {
    switch (type) {
      case "info":
        return {
          className: "bg-blue-500/10 text-blue-500",
          icon: <Bell className="mr-1 h-3 w-3" />,
        };
      case "reminder":
        return {
          className: "bg-yellow-500/10 text-yellow-500",
          icon: <Clock className="mr-1 h-3 w-3" />,
        };
      case "action":
        return {
          className: "bg-orange-500/10 text-orange-500",
          icon: <CheckSquare className="mr-1 h-3 w-3" />,
        };
      case "achievement":
        return {
          className: "bg-green-500/10 text-green-500",
          icon: <Award className="mr-1 h-3 w-3" />,
        };
      case "social":
        return {
          className: "bg-purple-500/10 text-purple-500",
          icon: <MessageSquare className="mr-1 h-3 w-3" />,
        };
      case "warning":
        return {
          className: "bg-red-500/10 text-red-500",
          icon: <AlertTriangle className="mr-1 h-3 w-3" />,
        };
      case "system":
        return {
          className: "bg-gray-500/10 text-gray-500",
          icon: <Server className="mr-1 h-3 w-3" />,
        };
      case "celebration":
        return {
          className: "bg-pink-500/10 text-pink-500",
          icon: <Gift className="mr-1 h-3 w-3" />,
        };
      default:
        return {
          className: "bg-primary/10 text-primary",
          icon: <Bell className="mr-1 h-3 w-3" />,
        };
    }
  };

  const badgeProps = getBadgeProps(announcement.notification.type);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge className={badgeProps.className}>
            {badgeProps.icon}
            {announcement.notification.type.charAt(0).toUpperCase() +
              announcement.notification.type.slice(1)}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            {announcement.notification.created_at}
          </div>
        </div>
        <h2 className="text-2xl font-bold">
          {announcement.notification.title}
        </h2>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={announcement.sender.image_url || "/placeholder.svg"}
              alt={`${announcement.sender.first_name} ${announcement.sender.last_name}`}
            />
            <AvatarFallback>
              {getInitials(
                announcement.sender.first_name?.charAt(0) || "U",
                announcement.sender.last_name?.charAt(0) || "N"
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {announcement.sender.first_name} {announcement.sender.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {/* Giả sử role được lấy từ bảng employment_details hoặc roles */}
              {announcement.sender.role || "Unknown"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none dark:prose-invert">
          {announcement.notification.message
            .split("\n\n")
            .map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
