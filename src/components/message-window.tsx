import { MessageCircle } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

//mock data
const unreadMessages = 3;

export function MessageWindow() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          area-label="Notifications"
          className="relative cursor-pointer transition-colors"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 " />
          {unreadMessages > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary"
            >
              {unreadMessages}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}
