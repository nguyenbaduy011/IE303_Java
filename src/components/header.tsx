"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "@/components/search-bar";
import { Profile } from "@/components/profile";
import { NotificationWindow } from "@/components/notification-window";
import { MessageWindow } from "@/components/message-window";
import { UserType } from "@/types/types";
import { ThemeToggle } from "@/theme/theme-toggle";
import SociusLogo from "./socius-logo";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/sidebar-nav";

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  user: UserType;
  isAdmin?: boolean;
}

export function Header({
  user,
  isAdmin = true,
  className,
  ...rest
}: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background ${className ?? ""}`}
      {...rest}
    >
      <div className="relative flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SidebarNav
              user={user}
              isAdmin={isAdmin}
              onClose={() => setIsSidebarOpen(false)}
            />
          </Sheet>
          <Link href={"/"}>
            <div className="relative h-12 w-24 md:h-10 md:w-10 object-contain">
              <SociusLogo className="dark:text-primary-foreground text-primary hover:animate-pulse" />
            </div>
          </Link>
        </div>
        <div className="hidden sm:flex items-center justify-center space-x-2 h-full py-4">
          <SearchBar />
          <ThemeToggle />
          <MessageWindow />
          <NotificationWindow currentUserId={user.id} />
          <Separator orientation="vertical" className="h-6 bg-primary" />
          <Profile user={user} />
        </div>
      </div>
    </header>
  );
}
