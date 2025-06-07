/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Mail, Lock, EyeOff, Eye } from "lucide-react";
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
import LoadingButton from "@/components/ui/loading-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginUser } from "@/app/api/login/route";
import { useAuth, UserType } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { user, setUser } = useAuth();

  // Kiểm tra session và chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (user && user.passwordChangeRequired) {
      router.push("/change-password");
    } else if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const setCookie = (name: string, value: string, maxAge?: number) => {
    document.cookie = `${name}=${value}; path=/; max-age=${
      maxAge || 86400
    }; SameSite=Strict`;
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

      if (!current_user.role || !current_user.role.id) {
        throw new Error("Invalid server response: Missing role information");
      }

      const permissions = current_user.role.permissions.map(
        (perm: { id: string; name: string; description: string }) => ({
          id: perm.id,
          name: perm.name,
          description: perm.description,
        })
      );

      const user: UserType = {
        id: current_user.user.id,
        email: current_user.user.email,
        first_name: current_user.user.firstName || "",
        last_name: current_user.user.lastName || "",
        sessionId: current_user.sessionId || "",
        passwordChangeRequired: current_user.passwordChangeRequired || false,
        hire_date: current_user.user.hireDate || "",
        birth_date: current_user.user.birthDate || "",
        gender: current_user.user.gender || "",
        nationality: current_user.user.nationality || "",
        image_url: current_user.user.imageUrl || null,
        phone_number: current_user.user.phoneNumber || "",
        address: current_user.user.address || "",
        role: {
          id: current_user.role.id,
          name: current_user.role.name || "",
          description: current_user.role.description,
          permissions: permissions,
        },
        working_status: current_user.user.working_status || "",
        salary: 0,
      };

      setUser(user);
      setCookie("user", encodeURIComponent(JSON.stringify(user)), 86400); // Lưu user vào cookie

      const isFirstTimeLogin = current_user.passwordChangeRequired;

      if (isFirstTimeLogin) {
        toast.info("This is your first login, please change your password!");
        router.push("/change-password");
      } else {
        toast.success("Login successful!");
        router.push("/dashboard");
      }
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
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md bg-card border-border shadow-md animate-fade-in p-6">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/20 p-3">
              <SociusLogo className="h-8 w-8 text-primary dark:text-card-foreground animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">
            Socius
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your company account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-input bg-card text-card-foreground focus:ring-2 focus:ring-ring focus:border-primary rounded-md"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-card-foreground">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-input bg-card text-card-foreground focus:ring-2 focus:ring-ring focus:border-primary rounded-md"
                  required
                />
                <Button
                  type="button"
                  variant={null}
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="pt-6">
            <LoadingButton
              type="submit"
              className="w-full bg-[#024023] text-[#ffffff] hover:bg-[#01331b] hover:shadow-md cursor-pointer hover:scale-105 transition-all rounded-md dark:bg-[#156b45] dark:text-[#ffffff] dark:hover:bg-[#1a6530]"
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </LoadingButton>
          </CardFooter>
        </form>
        <div className="pt-4 text-center text-sm text-muted-foreground">
          Need help? Contact your IT department
        </div>
      </Card>
    </div>
  );
}
