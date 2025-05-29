"use client";

import {
  Bell,
  BookUser,
  Calendar,
  CheckSquare,
  FileText,
  Home,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SheetContent } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@/components/ui/dialog";
import SociusLogo from "./socius-logo";
import { Button } from "@/components/ui/button";
import { UserType } from "@/contexts/auth-context";

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  user: UserType;
  isAdmin: boolean;
  onClose?: () => void;
}

export function SidebarNav({ isAdmin, onClose }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "My Team",
      href: "/teams",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "My Tasks",
      href: "/tasks",
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Messages",
      href: "/chat",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Notifications",
      href: "/my-notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      title: "Directory",
      href: "/directory",
      icon: <BookUser className="h-5 w-5" />,
    },
    {
      title: "Documents",
      href: "/documents",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const adminItems = [
    {
      title: "Admin Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Employees",
      href: "/admin/employees",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Teams",
      href: "/admin/teams",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Announcements",
      href: "/admin/announcements",
      icon: <Bell className="h-5 w-5" />,
    },
  ];

  const renderNavItems = (items: typeof navItems) => (
    <ul className="space-y-2">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.href}>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-accent"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={onClose}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </li>
        );
      })}
    </ul>
  );

  return (
    <SheetContent side="left" className="w-64 p-0">
      <VisuallyHidden>
        <DialogTitle>Navigation Menu</DialogTitle>
      </VisuallyHidden>
      <div className="flex flex-col h-full bg-background">
        <div className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 cursor-pointer"
              aria-label="Close navigation menu"
              onClick={onClose}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Link href={"/"}>
              <div className="relative h-12 w-24 md:h-10 md:w-10 object-contain">
                <SociusLogo className="dark:text-primary-foreground text-primary hover:animate-pulse" />
              </div>
            </Link>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-4 px-3">
          <nav className="flex flex-col gap-6">
            {renderNavItems(navItems)}
            {isAdmin && (
              <>
                <div className="relative">
                  <div className="absolute inset-x-0 -top-3 h-px bg-border" />
                </div>
                <div>
                  <h3 className="mb-2 px-3 text-xs font-medium text-muted-foreground">
                    Admin
                  </h3>
                  {renderNavItems(adminItems)}
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </SheetContent>
  );
}
