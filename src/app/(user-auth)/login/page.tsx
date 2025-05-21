"use client";
import { Mail, Lock } from "lucide-react";
import SociusLogo from "@/components/socius-logo";
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
import { Checkbox } from "@/components/ui/checkbox";
import LoadingButton from "@/components/ui/loading-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginUser } from "@/api/login/route";

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
      const current_user = await loginUser({ email, password });

      const isFirstTimeLogin = current_user.passwordChangeRequired;

      if (isFirstTimeLogin) {
        toast.info(
          "This is your first time login, please change your password!"
        );
        router.push("/change-password");
      } else {
        toast.success("Login successful!");
        console.log(current_user);
        router.push("/");
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.log(err);
      console.log(error);
      toast.error("Invalid email or password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-[#E9EEF6]">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-[#024023]/10 p-3">
              <SociusLogo className="h-8 w-8 text-[#024023]" />
              {/* <Building className="h-8 w-8 text-primary" /> */}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-black">
            Socius
          </CardTitle>
          <CardDescription className="text-[#67727e]">
            Sign in to your company account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#67727e]" />
                <Input
                  id="email"
                  placeholder="name@company.com"
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
                  Password
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                className="cursor-pointer peer border-input dark:bg-input/30 data-[state=checked]:bg-[#024023] data-[state=checked]:text-white  data-[state=checked]:border-[#062E26] focus-visible:border-[#006D56] focus-visible:ring-[#006D56]/50 aria-invalid:ring-[#E24B47]/20 aria-invalid:border-[#E24B47] size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
              >
                Remember me
              </Label>
            </div>
          </CardContent>
          <CardFooter className="pt-5">
            <LoadingButton
              type="submit"
              className="w-full bg-[#024023] text-white"
              disabled={isLoading}
              loading={false}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </LoadingButton>
          </CardFooter>
        </form>

        <div className="pt-3 text-center text-sm text-[#67727e]">
          Need help? Contact your IT department
        </div>
      </Card>
    </div>
  );
}
