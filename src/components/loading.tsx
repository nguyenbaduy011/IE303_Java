"use client";

import SociusLogo from "@/components/socius-logo";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#ffffff] animate-fade-in">
      <div className="flex flex-col items-center space-y-6">
        <div className="rounded-full bg-[#e6f0eb] p-4">
          <SociusLogo className="h-10 w-10 text-[#024023] animate-pulse" />
        </div>
        <p className="text-lg font-medium text-[#2a2a2a] animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
