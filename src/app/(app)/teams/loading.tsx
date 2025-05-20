import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TeamsLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Teams Sidebar Skeleton */}
        <Card className="md:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardHeader>
          <CardContent className="p-3">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 mb-2"
                >
                  <div className="flex items-center">
                    <Skeleton className="h-8 w-8 rounded-full mr-2" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Team Details Skeleton */}
        <div className="md:col-span-3 space-y-6">
          {/* Team Header Skeleton */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 md:mt-0">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-4 w-5/6 mb-6" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>

          {/* Tabs Skeleton */}
          <div className="space-y-4">
            <div className="flex space-x-1 border-b">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24" />
                ))}
            </div>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>

                  <Skeleton className="h-1 w-full" />

                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Skeleton className="h-32 w-full rounded-md" />
                      <Skeleton className="h-32 w-full rounded-md" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
