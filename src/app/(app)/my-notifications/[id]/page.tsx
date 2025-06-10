"use client";

import { useState } from "react";
import { Footer } from "@/components/footer";
import { UserAnnouncementDetail } from "@/components/user-announcements/user-announcement-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AnnouncementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [isRead, setIsRead] = useState(false);

  const markAsRead = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/notifications/${params.id}/read`, {
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
      setIsRead(true);
    } catch (err) {
      console.error("Error marking announcement as read:", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 bg-muted/20">
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
              <Link href="/my-announcements">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to announcements
                </Button>
              </Link>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={markAsRead}
                  disabled={isRead}
                >
                  <CheckCircle className="h-4 w-4" />
                  {isRead ? "Marked as read" : "Mark as read"}
                </Button>
              </div>
            </div>

            <UserAnnouncementDetail id={params.id} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
