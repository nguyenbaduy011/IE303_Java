"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
// import { SidebarNav } from "@/components/sidebar-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const shouldShowFooter = user && pathname !== "/chat";
  return (
    <>
      {/* {user?.passwordChangeRequired || (user && <Header user={user} />)} */}
      {user && <Header user={user} />}

      <main>
        <div className="relative mx-auto min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
      {/* {user?.passwordChangeRequired || (user && <Footer />)} */}
      {shouldShowFooter && <Footer />}
    </>
  );
}
