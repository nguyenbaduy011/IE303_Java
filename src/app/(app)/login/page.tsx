// src/app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import Link from "next/link";
import LoadingButton from "@/components/ui/loading-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginUser } from "@/api/login/route";
import { useAuth, UserType } from "@/contexts/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, setUser } = useAuth();

  // Kiểm tra session và chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const setCookie = (name: string, value: string, maxAge?: number) => {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge || 86400}; SameSite=Strict`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const current_user = await loginUser({ email, password });

      if (!current_user || !current_user.user || !current_user.user.id) {
        throw new Error("Invalid server response: Missing user information");
      }

      if (!current_user.user.role || !current_user.user.role.id) {
        throw new Error("Invalid server response: Missing role information");
      }

      const permissions = current_user.user.role.permissions.map(
        (perm: { name: string }) => perm.name
      );

      const user: UserType = {
        id: current_user.user.id,
        email: current_user.user.email,
        first_name: current_user.user.firstName || "",
        last_name: current_user.user.lastName || "",
        session_id: current_user.sessionId || "",
        passwordChangeRequired: current_user.passwordChangeRequired || false,
        hire_date: current_user.user.hireDate || "",
        birth_date: current_user.user.birthDate || "",
        gender: current_user.user.gender || "",
        nationality: current_user.user.nationality || "",
        image_url: current_user.user.imageUrl || "",
        phone_number: current_user.user.phoneNumber || "",
        address: current_user.user.address || "",
        role: {
          id: current_user.user.role.id,
          name: current_user.user.role.name || "",
          permissions: permissions,
        },
        working_status: current_user.user.working_status || "",
      };

      setUser(user);
      setCookie("user", encodeURIComponent(JSON.stringify(user))); // Lưu user vào cookie

      const isFirstTimeLogin = current_user.passwordChangeRequired;

      if (isFirstTimeLogin) {
        toast.info("This is your first login, please change your password!");
        router.push("/change-password");
      } else {
        toast.success("Login successful!");
        router.push("/dashboard");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Login failed:", err.message, err);

      const isFetchError = err.message === "Failed to fetch";

      const userMessage = isFetchError
        ? "Unable to connect to the server. Please check your internet connection or try again shortly."
        : err.message === "Sai mật khẩu"
          ? "Invalid password. Please try again."
          : "Invalid email or password. Please try again.";

      setError(userMessage);
      toast.error(userMessage);
      setIsLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-[#E9EEF6]">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-[#024023]/10 p-3">
              <SociusLogo className="h-8 w-8 text-[#024023]" />
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
              <div className="relative">
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

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="pt-5">
            <LoadingButton
              type="submit"
              className="w-full bg-[#024023] text-white"
              disabled={isLoading}
              loading={isLoading}
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
