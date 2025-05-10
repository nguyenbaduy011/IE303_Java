"use client";

import { UserType } from "@/types/types";
import {
  BarChart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Home,
  MessageSquare,
  ShieldAlert,
  Users,
  Vote,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  user: UserType;
  isAdmin: true;
}

export function SidebarNav({
  className,
  user,
  isAdmin,
  ...props
}: SidebarNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  //Hàm lấy ký tự đầu trong tên của user hiện tại sau đó viết hoa
  const getInitials = () => {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  };

  const navItems = [
    {
      title: "Home",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Chat",
      href: "/chat",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Vote",
      href: "/vote",
      icon: <Vote className="h-5 w-5" />,
    },
    {
      title: "Rankings",
      href: "/rankings",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: "Profile",
      href: "/profile",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  const adminItems = [
    {
      title: "Admin Dashboard",
      href: "/admin/dashboard",
      icon: <ShieldAlert className="h-5 w-5" />,
    },
    {
      title: "Admin Profile",
      href: "/admin/profile",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  const renderSidebarToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-md"
      )}
      onClick={() => setIsOpen((prev) => !prev)}
      aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
    >
      {isOpen ? (
        <ChevronLeft className="h-3 w-3" />
      ) : (
        <ChevronRight className="h-3 w-3" />
      )}
    </Button>
  );

  const renderNavItems = (items: typeof navItems) => (
    <ul className="space-y-2">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.href}>
            {!isOpen ? (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isOpen ? "justify-start" : "justify-center",
                        isActive
                          ? "bg-accent text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {item.icon}
                      {isOpen && <span>{item.title}</span>}
                    </Link>
                  </TooltipTrigger>
                  {!isOpen && (
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isOpen ? "justify-start" : "justify-center",
                  isActive
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.icon}
                {isOpen && <span>{item.title}</span>}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <div
        className={cn(
          "flex flex-col border-r bg-background transition-all min-h-[calc(100vh-4rem)] duration-300 ease-in-out",
          isOpen ? "w-64" : "w-[70px]",
          className
        )}
        {...props}
      >
        {renderSidebarToggle()}

        <div
          className={cn(
            "flex h-14 items-center border-b px-4",
            isOpen ? "justify-start" : "justify-center"
          )}
        >
          {isOpen ? (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2",
                  isOpen ? "justify-start" : "justify-center"
                )}
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Avatar>
                    <AvatarImage src={`${user.image_url}`} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {isOpen && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">John Doe</span>
                    <span className="text-xs text-muted-foreground">
                      john@example.com
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/" className="flex items-center justify-center">
              <Avatar>
                <AvatarImage src={`${user.image_url}`} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
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
                  {isOpen && (
                    <h3 className="mb-2 px-3 text-xs font-medium text-muted-foreground">
                      Admin
                    </h3>
                  )}
                  {renderNavItems(adminItems)}
                </div>
              </>
            )}
          </nav>
        </div>
        {/* Keyboard shortcut hint */}
        {isOpen && (
          <div className="px-4 py-2 text-xs text-muted-foreground border-t">
            <span>
              Tip: Press{" "}
              <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+B</kbd> to
              toggle sidebar
            </span>
          </div>
        )}
      </div>
    </>
  );
}

{
  /* <div className="border-t p-4">
  <div className="flex items-center justify-between">
    <ThemeToggle />
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-2 text-muted-foreground"
    >
      <LogOut className="h-4 w-4" />
      <span>Log out</span>
    </Button>
  </div>
</div>; */
}
