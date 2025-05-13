import {
  Building,
  Calendar,
  Facebook,
  FileText,
  HelpCircle,
  Instagram,
  Linkedin,
  Phone,
  Shield,
  Twitter,
  Users,
} from "lucide-react";

import Link from "next/link";
import SociusLogo from "./socius-logo";

export function Footer({
  className,
  ...rest
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={`bg-background border-t ${className ?? ""}`} {...rest}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4 ">
            <div className="flex items-center">
              {/* <Image src="/icon.svg" alt="socius" width={25} height={25} /> */}
              <SociusLogo className="w-[25px] h-[25px]" />
              <p className="text-lg font-semibold ml-2">Socius</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Your all-in-one platform for employee collaboration and workplace
              community.
            </p>
            <div className="flex space-x-4 ">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
          {/* Employee Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Employee Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Documents & Forms</span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Time Off Requests</span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Building className="h-4 w-4" />
                  <span>Company Policies</span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Help Center</span>
                </Link>
              </li>
            </ul>
          </div>
          {/* Social Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Team Directory</span>
                </Link>
              </li>
              {/* <li>
                <Link
                  href="#"
                  className="hover:text-foreground flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Discussion Forums</span>
                </Link>
              </li> */}
              {/* <li>
                <Link
                  href="#"
                  className="hover:text-foreground flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Company Events</span>
                </Link>
              </li> */}
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Interest Groups</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Contact & Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  <span>IT Support</span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span>HR Department</span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Terms of Use</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 flex flex-col sm:flex-row justify-between items-center ">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Socius. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-2 sm:mt-0">
            An internal platform for employees of Acme Corporation
          </p>
        </div>
      </div>
    </footer>
  );
}
