import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TeamDetailsLoading() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div>
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[180px] mt-2" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="bg-muted/50 p-4 rounded-lg">
                      <Skeleton className="h-4 w-[100px] mb-1" />
                      <Skeleton className="h-8 w-[60px]" />
                    </div>
                  ))}
              </div>

              <Skeleton className="h-[1px] w-full" />

              <div>
                <Skeleton className="h-6 w-[150px] mb-4" />
                <div className="space-y-2">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-5 w-[300px]" />
                      </div>
                    ))}
                </div>
              </div>

              <Skeleton className="h-[1px] w-full" />

              <div>
                <Skeleton className="h-6 w-[180px] mb-4" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[100px]" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div>
                <Skeleton className="h-5 w-[150px]" />
                <Skeleton className="h-4 w-[120px] mt-1" />
              </div>
            </div>

            <Skeleton className="h-[1px] w-full my-4" />

            <div className="space-y-4">
              <Skeleton className="h-6 w-[150px]" />
              {Array(2)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Skeleton className="h-5 w-[150px]" />
                        <Skeleton className="h-5 w-[80px]" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-4 w-[80px]" />
                      </div>
                      <div className="flex mt-2">
                        {Array(3)
                          .fill(0)
                          .map((_, j) => (
                            <Skeleton
                              key={j}
                              className="h-6 w-6 rounded-full -ml-1 first:ml-0"
                            />
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Skeleton className="h-10 w-[300px]" />

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-[150px]" />
                      <Skeleton className="h-4 w-[120px] mt-1" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Skeleton className="h-4 w-[180px]" />
                      <Skeleton className="h-4 w-[100px] mt-1" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
