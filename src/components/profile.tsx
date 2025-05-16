"use client";

import { ChevronDown, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { UserType } from "@/types/types";
import { useState } from "react";
import { formatDateShort } from "@/utils/dateFormatter";

interface ProfileProps {
  user: UserType;
}

// export function Profile({ user }: { user: User }) {
export function Profile({ user }: ProfileProps) {
  const [isOpen, setIsOpen] = useState(false);

  //Hàm lấy tên đầy đủ của user hiện tại
  const getFullName = () => {
    return `${user.first_name} ${user.last_name}`.trim();
  };

  //Hàm lấy ký tự đầu trong tên của user hiện tại sau đó viết hoa
  const getInitials = () => {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  };

  const formattedHiredDate = formatDateShort(user.hire_date);

  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          area-label="User menu"
          className="cursor-pointer text-muted-foreground hover:bg-accent hover:text-accent-foreground p-2 transition-colors flex items-center gap-2"
        >
          <Avatar className="h-8 w-8 border-2 border-primary/20">
            <AvatarImage src={`${user.image_url}`} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : " "}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white w-64 border border-slate-200 shadow-lg rounded-lg"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-3 border-b border-slate-100 ">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-primary/20">
              <AvatarImage
                src={user.image_url || "placeholder.svg"}
                alt={getFullName()}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="font-bold text-primary text-sm">{getFullName()}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <p className="text-xs text-slate-400 mt-1">
                {user.nationality} • Joined {formattedHiredDate}
              </p>
            </div>
          </div>
        </div>
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem
            asChild
            className="cursor-pointer hover:bg-slate-100 "
          >
            <Link href="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4 text-primary" />
              <span className="text-primary">My Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="p-1">
          <DropdownMenuItem
            className="cursor-pointer text-red-400 focus:text-red-500 focus:bg-red-50"
            onClick={async () => {}}
          >
            <div className="flex items-center">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
