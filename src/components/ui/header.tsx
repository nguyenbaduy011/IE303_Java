"use client";

import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "@/components/ui/search-bar";
import { Profile } from "@/components/ui/profile";
import { NotificationWindow } from "@/components/ui/notification-window";
import { MessageWindow } from "@/components/ui/message-window";
import { UserType } from "@/types/types";

interface HeaderProps {
  user: UserType;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto flex justify-between items-center h-16 px-4 md:px-6 bg-white  ">
        <div className="">
          <Link href={"/"}>
            <div className="relative h-12 w-24 md:h-10 md:w-10 object-contain">
              <Image src="/icon.svg" alt="Socius" fill priority />
            </div>
          </Link>
        </div>
        <div className="hidden sm:flex items-center justify-center space-x-2 h-full py-4">
          <SearchBar />
          <MessageWindow />
          <NotificationWindow currentUserId={user.id} />
          <Separator orientation="vertical" className="h-6 bg-[#024023]" />
          <Profile user={user} />
        </div>
      </div>
    </header>
  );
}
