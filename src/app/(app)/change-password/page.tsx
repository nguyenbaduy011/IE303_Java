/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Eye, EyeOff, Lock, Shield, X } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/theme/theme-toggle";
import { PasswordSchema } from "@/lib/validations";
import { changePassword } from "@/app/api/change-password/route";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstTime = searchParams.get("first") === "true";

  useEffect(() => {
    // Kiểm tra mật khẩu với Zod
    const result = PasswordSchema.safeParse(newPassword);
    const requirements = {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    };

    if (result.success) {
      // Mật khẩu đạt tất cả yêu cầu
      requirements.length = true;
      requirements.uppercase = true;
      requirements.lowercase = true;
      requirements.number = true;
      requirements.special = true;
    } else {
      // Kiểm tra từng lỗi để cập nhật requirements
      result.error.issues.forEach((issue) => {
        if (issue.path.includes("length")) requirements.length = false;
        if (issue.path.includes("uppercase")) requirements.uppercase = false;
        if (issue.path.includes("lowercase")) requirements.lowercase = false;
        if (issue.path.includes("number")) requirements.number = false;
        if (issue.path.includes("special")) requirements.special = false;
      });

      // Đặt true cho các yêu cầu đã đạt
      if (newPassword.length >= 8) requirements.length = true;
      if (/[A-Z]/.test(newPassword)) requirements.uppercase = true;
      if (/[a-z]/.test(newPassword)) requirements.lowercase = true;
      if (/[0-9]/.test(newPassword)) requirements.number = true;
      if (/[^A-Za-z0-9]/.test(newPassword)) requirements.special = true;
    }

    // Tính passwordStrength: 20 điểm cho mỗi yêu cầu đạt được
    const strength =
      (requirements.length ? 20 : 0) +
      (requirements.uppercase ? 20 : 0) +
      (requirements.lowercase ? 20 : 0) +
      (requirements.number ? 20 : 0) +
      (requirements.special ? 20 : 0);

    setPasswordRequirements(requirements);
    setPasswordStrength(strength);
  }, [newPassword]);

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-destructive";
    if (passwordStrength < 80) return "bg-amber-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (passwordStrength < 60) {
      setError("Please create a stronger password");
      setIsLoading(false);
      return;
    }

    try {
      const res = await changePassword({
        currentPassword: "1",
        newPassword,
        confirmPassword,
      });

      if (!res.success || res.status === 401 || res.status === 403) {
        setError(res.error || "Failed to change password. Please try again.");
        return;
      }

      // Đổi mật khẩu thành công, chuyển hướng tới dashboard
      toast.success("Password changed successfully!");
      router.push("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Bắt lỗi bất ngờ (ví dụ: mất kết nối mạng)
      console.error("Password change error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md bg-background">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isFirstTime ? "Welcome to Socius" : "Change Your Password"}
          </CardTitle>
          <CardDescription>
            {isFirstTime
              ? "Please set a new password to continue to your account"
              : "Update your password to keep your account secure"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showPassword1 ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  required
                />
                <Button
                  type="button"
                  variant={null}
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                  onClick={() => setShowPassword1(!showPassword1)}
                >
                  {showPassword1 ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Password Strength</div>
              <Progress
                value={passwordStrength}
                className={`h-2 ${getStrengthColor()}`}
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Requirements</div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  {passwordRequirements.length ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      passwordRequirements.length
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    At least 8 characters
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordRequirements.uppercase ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      passwordRequirements.uppercase
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    At least one uppercase letter
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordRequirements.lowercase ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      passwordRequirements.lowercase
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    At least one lowercase letter
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordRequirements.number ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      passwordRequirements.number
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    At least one number
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordRequirements.special ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      passwordRequirements.special
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    At least one special character
                  </span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showPassword2 ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
                <Button
                  type="button"
                  variant={null}
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                  onClick={() => setShowPassword2(!showPassword2)}
                >
                  {showPassword2 ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-destructive">
                  Passwords do not match
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save New Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
