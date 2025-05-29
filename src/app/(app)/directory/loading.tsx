import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DirectoryLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="all" disabled>
            All Employees
          </TabsTrigger>
          <TabsTrigger value="department" disabled>
            By Department
          </TabsTrigger>
          <TabsTrigger value="location" disabled>
            By Location
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(12)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="h-24 w-full" />
                    <div className="p-4 pt-0 -mt-12">
                      <Skeleton className="h-24 w-24 rounded-full" />
                      <div className="mt-2">
                        <Skeleton className="h-6 w-32 mt-2" />
                        <Skeleton className="h-4 w-24 mt-2" />
                        <Skeleton className="h-4 w-32 mt-2" />
                        <Skeleton className="h-4 w-28 mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
