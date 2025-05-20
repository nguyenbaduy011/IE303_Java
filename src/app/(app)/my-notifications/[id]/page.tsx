import { Footer } from "@/components/footer";
import { UserAnnouncementDetail } from "@/components/user-announcements/user-announcement-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Flag } from "lucide-react";
import Link from "next/link";

export default function AnnouncementDetailPage({
  params,
}: {
  params: { id: string };
}) {
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
                <Button variant="outline" size="sm" className="gap-2">
                  <Flag className="h-4 w-4" />
                  Mark as important
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Mark as read
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
