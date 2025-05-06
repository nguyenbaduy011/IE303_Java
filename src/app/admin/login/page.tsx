"use client";
import { Mail, Lock, ShieldAlert, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import LoadingButton from "@/components/ui/loading-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Login successful!");
      router.push("/");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.log(err);
      console.log(error);
      toast.error("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-[#E9EEF6]">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-[#024023]/10 p-3">
              <ShieldAlert className="h-8 w-8 text-[#024023]" />
              {/* <Building className="h-8 w-8 text-primary" /> */}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Administrator Access
          </CardTitle>
          <CardDescription>Sign in to the Socius admin portal</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <Alert
              variant="destructive"
              className="bg-[#EE4444]/10 border-[#EE4444]/30 text-[#EE4444]"
            >
              <AlertCircle className="w-4 h-4" />{" "}
              <AlertTitle>Restricted Area</AlertTitle>
              <AlertDescription>
                This portal is for authorized administrators only. Unauthorized
                access attempts are logged and monitored.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black">
                Admin Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#67727e]" />
                <Input
                  id="email"
                  placeholder="admin@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-[#E9F1F7]"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-black">
                  Admin Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative ">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#67727e]" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-[#E9F1F7]"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-5 flex flex-col gap-2">
            <LoadingButton
              type="submit"
              className="w-full bg-[#024023] text-white"
              disabled={isLoading}
              loading={false}
            >
              {isLoading ? "Authenticating..." : "Access Admin Portal"}
            </LoadingButton>
            <Button
              type="button"
              variant="outline"
              className="w-full border-[#E9F1F7]"
              onClick={() => router.push("/login")}
            >
              Return to Employee Login
            </Button>
          </CardFooter>
        </form>

        <div className="pt-3 text-center text-sm text-[#67727e]">
          Need help? Contact your IT department
        </div>
      </Card>
    </div>
  );
}
