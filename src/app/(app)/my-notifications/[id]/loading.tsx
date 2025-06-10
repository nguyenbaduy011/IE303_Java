import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AnnouncementDetailLoading() {
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
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>

            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="mt-1 h-4 w-24" />
                </div>
                <div className="ml-auto">
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-60 w-full" />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
