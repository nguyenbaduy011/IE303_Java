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

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  user: UserType;
}

export function Header({ user, className, ...rest }: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background ${
        className ?? ""
      }`}
      {...rest}
    >
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="">
          <Link href={"/"}>
            {/* <div className="relative h-12 w-24 md:h-10 md:w-10 object-contain">
              <Image src="/icon.svg" alt="Socius" fill priority />
            </div> */}
            <div className="relative h-12 w-24 md:h-10 md:w-10 object-contain">
              <SociusLogo className="dark:text-primary-foreground text-primary"/>
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
