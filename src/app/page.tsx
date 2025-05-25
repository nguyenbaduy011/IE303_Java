// src/app/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import SociusLogo from "@/components/socius-logo";
import { useAuth } from "@/contexts/auth-context";
import StarfieldBackground from "@/components/dots-background";

export default function WelcomePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Handle redirect for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/dashboard");
    }
  }, [user, isAuthenticated, router]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Starfield background */}
      <StarfieldBackground />

      {/* Blur effect with parallax */}
      <div
        className="absolute top-1/2 left-1/2 w-[600px] h-[300px] transform -translate-x-1/2 -translate-y-1/2 z-[-1]"
        style={{
          background: "var(--primary-900)",
          opacity: 0.7,
          filter: "blur(50px)",
        }}
      />

      {/* Socius Logo */}
      <div className="absolute top-8 left-8 z-10">
        <SociusLogo className="w-12 h-12 text-white animate-fade-in" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in"
          style={{ color: "var(--primary-foreground)" }}
        >
          Welcome to Socius
        </h1>
        <p
          className="text-lg md:text-2xl max-w-2xl mx-auto mb-8 animate-fade-in"
          style={{ color: "var(--secondary)", animationDelay: "0.2s" }}
        >
          Connect, collaborate, and thrive with our innovative platform designed
          for modern teams.
        </p>
      </div>

      {/* Action button: Login or Dashboard */}
      <div className="absolute top-8 right-8 z-10">
        {isAuthenticated && user ? (
          <Button
            asChild
            className="p-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in"
            style={{
              background: "var(--secondary)",
              color: "#FFF",
              animationDelay: "0.4s",
            }}
          >
            <Link href="/dashboard">
              <SociusLogo className="w-8 h-8 text-white" />
            </Link>
          </Button>
        ) : (
          <Button
            asChild
            className="px-8 py-4 text-xl font-bold rounded-lg shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 animate-fade-in group"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)",
              color: "#FFF",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              animationDelay: "0.4s",
            }}
          >
            <Link
              href="/login"
              className="group-hover:bg-[linear-gradient(135deg,var(--primary-400),var(--primary-600))] transition-all duration-300"
            >
              Login
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
