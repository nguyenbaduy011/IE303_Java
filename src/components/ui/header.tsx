import { Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto flex justify-between items-center h-16 px-6 bg-white border-b-2 border-[#024023]">
        <Link className="" href={"/"}>
          <div className="relative h-20 w-40">
            <Image
              src="/socius.svg"
              alt="Socius"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </Link>
        <div className="">
          <div> search</div>
        </div>
        <div className="hidden flex items-center space-x-2 h-full py-4">
          <Bell className="w-6 h-6 text-[#024023]" />
          <Separator orientation="vertical" className="h-6 bg-white" />
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://uploads.dailydot.com/2024/08/mocking-spongebob-meme-.jpg?q=65&auto=format&w=1600&ar=2:1&fit=crop" />
          </Avatar>
        </div>
      </div>
    </header>
  );
}
