"use client";

import { Footer } from "@/components/footer";
import { UserAnnouncementsList } from "@/components/user-announcements/user-announcement-list";
import { AnnouncementFilters } from "@/components/user-announcements/announcement-filters";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle } from "lucide-react";
import { NotiType } from "@/types/types";
import { useState } from "react";

export default function MyAnnouncementsPage() {
  const [filterType, setFilterType] = useState<NotiType[] | null>(null);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 bg-muted/20">
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold">My Announcements</h1>
                <p className="text-muted-foreground">
                  Stay updated with announcements from your team leaders and
                  superiors
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Mark all as read
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <TabsList>
                  <TabsTrigger value="all" className="gap-2">
                    All
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      12
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="gap-2">
                    Unread
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      5
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="important" className="gap-2">
                    Important
                    <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
                      3
                    </span>
                  </TabsTrigger>
                </TabsList>
                <div className="mt-4 sm:mt-0">
                  <AnnouncementFilters
                    onFilterChange={(types) => setFilterType(types)}
                  />
                </div>
              </div>

              <TabsContent value="all" className="space-y-4">
                <UserAnnouncementsList
                  filter="all"
                  filterType={filterType ?? []}
                />
              </TabsContent>

              <TabsContent value="unread" className="space-y-4">
                <UserAnnouncementsList
                  filter="unread"
                  filterType={filterType ?? []}
                />
              </TabsContent>

              <TabsContent value="important" className="space-y-4">
                <UserAnnouncementsList
                  filter="important"
                  filterType={filterType ?? []}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
