import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SidebarNav } from "@/components/sidebar-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyAnnouncementsLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        user={{
          id: "",
          first_name: "",
          last_name: "",
          email: "",
          birth_date: "",
          image_url: "",
          gender: "male",
          nationality: "",
          phone_number: "",
          hire_date: "",
          address: "",
          session_id: "",
          passwordChangeRequired: false,
          role: { id: "", name: "", permissions: [] },
          working_status: "",
        }}
      />
      <div className="flex flex-1 bg-muted/20">
        <SidebarNav
          user={{
            id: "",
            first_name: "",
            last_name: "",
            email: "",
            birth_date: "",
            image_url: "",
            gender: "male",
            nationality: "",
            phone_number: "",
            hire_date: "",
            address: "",
            session_id: "",
            passwordChangeRequired: false,
            role: { id: "", name: "", permissions: [] },
            working_status: "",
          }}
          isAdmin={false}
        />
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="mt-2 h-5 w-96" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-36" />
              </div>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <TabsList>
                  <TabsTrigger value="all" className="gap-2">
                    All
                    <Skeleton className="h-5 w-8 rounded-full" />
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="gap-2">
                    Unread
                    <Skeleton className="h-5 w-8 rounded-full" />
                  </TabsTrigger>
                  <TabsTrigger value="important" className="gap-2">
                    Important
                    <Skeleton className="h-5 w-8 rounded-full" />
                  </TabsTrigger>
                </TabsList>
                <div className="mt-4 sm:mt-0">
                  <Skeleton className="h-9 w-48" />
                </div>
              </div>

              <TabsContent value="all" className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
