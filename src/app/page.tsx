"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import SociusLogo from "@/components/socius-logo";
import { useAuth } from "@/contexts/auth-context";
import StarfieldBackground from "@/components/dots-background";
import { useTheme } from "next-themes";

export const ThemeToggle = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleToggle = () => {
    const newTheme = (resolvedTheme === "dark" ? "light" : "dark") as
      | "light"
      | "dark";
    setTheme(newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      aria-label="Toggle Theme"
      className="relative w-8 h-8 rounded-full flex items-center justify-center focus:outline-none cursor-pointer focus:ring-2 focus:ring-[#156b45] hover:bg-[#b8d4cb]/50 dark:hover:bg-[#01331b]/50 transition-all duration-300"
    >
      <svg
        className="w-6 h-6 text-yellow-500 dark:text-blue-300"
        viewBox="0 0 24 24"
      >
        <mask id="moon-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <circle
            cx="24"
            cy="10"
            r="6"
            fill="black"
            className={resolvedTheme === "dark" ? "translate-x-[-7px]" : ""}
          />
        </mask>
        <circle
          cx="12"
          cy="12"
          r="6"
          mask="url(#moon-mask)"
          fill="currentColor"
        />
        <g
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-all duration-300 ${resolvedTheme === "dark" ? "opacity-0 rotate-[-25deg]" : "opacity-100 rotate-0"}`}
        >
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
      </svg>
    </button>
  );
};

export default function WelcomePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/dashboard");
    }
  }, [user, isAuthenticated, router]);

  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <StarfieldBackground theme={(resolvedTheme === "dark" ? "dark" : "light") as "light" | "dark"} />

      {/* Blur background */}
      <div
        className="absolute top-1/2 left-1/2 w-[600px] h-[300px] transform -translate-x-1/2 -translate-y-1/2 z-[-1]"
        style={{
          background: isDark ? "#012d17" : "#e6f3ef",
          opacity: 0.7,
          filter: "blur(50px)",
        }}
      />

      {/* Logo */}
      <div className="absolute top-8 left-8 z-10">
        <SociusLogo
          className={`w-12 h-12 ${isDark ? "text-white" : "text-[#024023]"} animate-fade-in`}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in"
          style={{ color: isDark ? "var(--primary-foreground)" : "#024023" }}
        >
          Welcome to Socius
        </h1>
        <p
          className="text-lg md:text-2xl max-w-2xl mx-auto mb-8 animate-fade-in"
          style={{
            color: isDark ? "var(--primary-foreground)" : "#1a3b2a",
            animationDelay: "0.2s",
          }}
        >
          Connect, collaborate, and thrive with our innovative platform designed
          for modern teams.
        </p>
      </div>

      {/* Action buttons */}
      <div className="absolute top-8 right-8 z-10 flex items-center gap-4">
        <ThemeToggle />

        {isAuthenticated && user ? (
          <Button
            asChild
            className="p-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in"
            style={{
              background: isDark ? "var(--secondary)" : "#e6f3ef",
              color: isDark ? "#FFF" : "#024023",
              animationDelay: "0.4s",
            }}
          >
            <Link href="/dashboard">
              <SociusLogo
                className={`w-8 h-8 ${isDark ? "text-white" : "text-[#024023]"}`}
              />
            </Link>
          </Button>
        ) : (
          <Button
            asChild
            className={`px-8 py-4 text-xl font-bold rounded-lg shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 animate-fade-in ${
              isDark
                ? "bg-[#024023] text-[#ffffff] hover:bg-[#01331b] dark:bg-[#156b45] dark:text-[#ffffff] dark:hover:bg-[#1a6530]"
                : "bg-[#e6f3ef] text-[#024023] hover:bg-[#b8d4cb] hover:text-[#01331b]"
            }`}
            style={{ animationDelay: "0.4s" }}
          >
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
