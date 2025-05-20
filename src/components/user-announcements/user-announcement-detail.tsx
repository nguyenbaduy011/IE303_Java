"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Bell, Calendar, Download, Star, Users } from "lucide-react";

interface UserAnnouncementDetailProps {
  id: string;
}

export function UserAnnouncementDetail({ id }: UserAnnouncementDetailProps) {
  const [announcement, setAnnouncement] = useState(
    mockUserAnnouncements.find((a) => a.id === id)
  );

  useEffect(() => {
    // In a real app, you would fetch the announcement details from an API
    setAnnouncement(mockUserAnnouncements.find((a) => a.id === id));
  }, [id]);

  if (!announcement) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="mb-4 text-lg font-semibold">Announcement not found</p>
            <p className="text-muted-foreground">
              The announcement you're looking for doesn't exist or has been
              removed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge
            className={
              announcement.type === "team"
                ? "bg-blue-500/10 text-blue-500"
                : announcement.type === "department"
                  ? "bg-purple-500/10 text-purple-500"
                  : announcement.type === "company"
                    ? "bg-primary/10 text-primary"
                    : "bg-orange-500/10 text-orange-500"
            }
          >
            {announcement.type === "team" ? (
              <Users className="mr-1 h-3 w-3" />
            ) : announcement.type === "department" ? (
              <Bell className="mr-1 h-3 w-3" />
            ) : announcement.type === "company" ? (
              <Star className="mr-1 h-3 w-3" />
            ) : (
              <Bell className="mr-1 h-3 w-3" />
            )}
            {announcement.type === "team"
              ? "Team"
              : announcement.type === "department"
                ? "Department"
                : announcement.type === "company"
                  ? "Company"
                  : "Personal"}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            {announcement.date}
          </div>
        </div>
        <h2 className="text-2xl font-bold">{announcement.title}</h2>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={announcement.sender.avatar || "/placeholder.svg"}
              alt={announcement.sender.name}
            />
            <AvatarFallback>{announcement.sender.initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{announcement.sender.name}</p>
            <p className="text-xs text-muted-foreground">
              {announcement.sender.role}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none dark:prose-invert">
          {announcement.content.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {announcement.hasAttachments && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium">Attachments</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md border p-2">
                <div className="flex items-center gap-2">
                  <div className="rounded bg-primary/10 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Project_Guidelines.pdf
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF • 2.4 MB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
              {announcement.type === "team" && (
                <div className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded bg-primary/10 p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M8 18v-1" />
                        <path d="M12 18v-6" />
                        <path d="M16 18v-3" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Updated_Timeline.xlsx
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Excel • 1.8 MB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
