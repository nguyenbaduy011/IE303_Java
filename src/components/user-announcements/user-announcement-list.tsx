"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Award,
  Bell,
  Calendar,
  CheckCircle,
  CheckSquare,
  Clock,
  Gift,
  MessageSquare,
  Search,
  Server,
} from "lucide-react";
import { Announcement, AnnouncementFilter } from "@/types/announcements-page";
import { getInitials } from "@/utils/getInitials";
import { NotiType } from "@/types/types";

interface UserAnnouncementsListProps {
  filter: AnnouncementFilter;
  filterType: NotiType[];
}

export function UserAnnouncementsList({
  filter,
  filterType,
}: UserAnnouncementsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch announcements từ API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch("/api/announcements", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized: Please log in again");
          }
          throw new Error("Failed to fetch announcements");
        }

        const data = await response.json();

        const mappedData: Announcement[] = data.map(
          (notification: Announcement) => ({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            is_urgent: notification.is_urgent,
            is_read: notification.is_read || false,
            created_at: new Date(notification.created_at).toLocaleDateString(),
            sender: {
              id: notification.sender.id,
              first_name: notification.sender?.first_name || "Unknown",
              last_name: notification.sender?.last_name || "Unknown",
              role: notification.sender?.role || "Unknown",
              avatar: notification.sender?.image_url || null,
              initials: getInitials(
                notification.sender?.first_name?.charAt(0) || "U",
                notification.sender?.last_name?.charAt(0) || "N"
              ),
            },
            hasAttachments: notification.hasAttachments || false,
            allowComments: notification.allowComments || false,
            comments: notification.comments || 0,
          })
        );
        setAnnouncements(mappedData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(
          err.message || "Failed to load announcements. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [filter]);

  // Đánh dấu thông báo là đã đọc
  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/announcements/${id}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_read: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }
      setAnnouncements(
        announcements.map((announcement) =>
          announcement.id === id
            ? { ...announcement, is_read: true }
            : announcement
        )
      );
    } catch (err) {
      console.error("Error marking announcement as read:", err);
    }
  };

  // Lọc thông báo dựa trên filter, filterType và search query
  const filteredAnnouncements = announcements
    .filter((announcement) => {
      if (filter === "unread") return !announcement.is_read;
      if (filter === "important") return announcement.is_urgent;
      return true;
    })
    .filter((announcement) =>
      filterType.length === 0 ? true : filterType.includes(announcement.type)
    )
    .filter(
      (announcement) =>
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Loading announcements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="link" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Input
          placeholder="Search announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>

      {filteredAnnouncements.length > 0 ? (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              className={
                announcement.is_read ? "" : "border-l-4 border-l-primary"
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge
                    className={
                      announcement.type === "info"
                        ? "bg-blue-500/10 text-blue-500"
                        : announcement.type === "reminder"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : announcement.type === "action"
                            ? "bg-orange-500/10 text-orange-500"
                            : announcement.type === "achievement"
                              ? "bg-green-500/10 text-green-500"
                              : announcement.type === "social"
                                ? "bg-purple-500/10 text-purple-500"
                                : announcement.type === "warning"
                                  ? "bg-red-500/10 text-red-500"
                                  : announcement.type === "system"
                                    ? "bg-gray-500/10 text-gray-500"
                                    : "bg-pink-500/10 text-pink-500"
                    }
                  >
                    {announcement.type === "info" ? (
                      <Bell className="mr-1 h-3 w-3" />
                    ) : announcement.type === "reminder" ? (
                      <Clock className="mr-1 h-3 w-3" />
                    ) : announcement.type === "action" ? (
                      <CheckSquare className="mr-1 h-3 w-3" />
                    ) : announcement.type === "achievement" ? (
                      <Award className="mr-1 h-3 w-3" />
                    ) : announcement.type === "social" ? (
                      <MessageSquare className="mr-1 h-3 w-3" />
                    ) : announcement.type === "warning" ? (
                      <AlertTriangle className="mr-1 h-3 w-3" />
                    ) : announcement.type === "system" ? (
                      <Server className="mr-1 h-3 w-3" />
                    ) : (
                      <Gift className="mr-1 h-3 w-3" />
                    )}
                    {announcement.type.charAt(0).toUpperCase() +
                      announcement.type.slice(1)}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    {announcement.created_at}
                  </div>
                </div>
                <Link
                  href={`/my-announcements/${announcement.id}`}
                  className="hover:underline"
                >
                  <h3 className="text-lg font-semibold">
                    {announcement.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={announcement.sender.image_url || "/placeholder.svg"}
                      alt={`${announcement.sender.first_name} ${announcement.sender.last_name}`}
                    />
                    <AvatarFallback>
                      {announcement.sender.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    From {announcement.sender.first_name}{" "}
                    {announcement.sender.last_name} • {announcement.sender.role}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="line-clamp-2 text-muted-foreground">
                  {announcement.message}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-0">
                <div className="flex items-center gap-2">
                  {!announcement.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => markAsRead(announcement.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span className="sr-only">Mark as read</span>
                    </Button>
                  )}
                  <Link href={`/my-announcements/${announcement.id}`}>
                    <Button variant="ghost" size="sm">
                      Read More
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No announcements found matching your criteria.
          </p>
          {searchQuery && (
            <Button variant="link" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          )}
        </div>
      )}

      {filteredAnnouncements.length > 5 && (
        <div className="flex items-center justify-center">
          <Button variant="outline">Load More</Button>
        </div>
      )}
    </div>
  );
}
