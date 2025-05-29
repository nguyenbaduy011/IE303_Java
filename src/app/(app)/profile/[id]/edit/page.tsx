/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Flag,
  Upload,
  Save,
  X,
  AlertCircle,
  Check,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import LoadingButton from "@/components/ui/loading-button";
import { useAuth } from "@/contexts/auth-context";
import {
  profileFormSchema,
  ProfileForm,
  PasswordSchema,
} from "@/lib/validations";
import { toast } from "sonner";
import { z } from "zod";
import { changePassword } from "@/api/change-password/route";

interface ChangePasswordResponse {
  success: boolean;
  error?: string;
  status?: number;
}

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user, setUser, logout } = useAuth();
  const userId = params.id as string;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formState, setFormState] = useState<{
    error: string | null;
    passwordError: string | null;
    success: string | null;
    passwordSuccess: boolean;
  }>({
    error: null,
    passwordError: null,
    success: null,
    passwordSuccess: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Check if user is authenticated and authorized
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.id !== userId) {
      setFormState((prev) => ({
        ...prev,
        error: "You are not authorized to edit this profile.",
      }));
      router.push(`/profiles/${user.id}`);
    }
  }, [user, router, userId]);

  // Initialize profile form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
      address: user?.address || "",
      birth_date:
        user?.birth_date && !isNaN(new Date(user.birth_date).getTime())
          ? new Date(user.birth_date).toISOString().split("T")[0]
          : "",
      nationality: user?.nationality || "",
      gender:
        user?.gender === "male" || user?.gender === "female"
          ? user.gender
          : "male",
    },
    mode: "onChange",
  });

  // Define password form schema
  const passwordFormSchema = z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: PasswordSchema,
      confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  type ChangePasswordForm = z.infer<typeof passwordFormSchema>;

  // Initialize password form
  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Update password strength and requirements
  const watchedNewPassword = passwordForm.watch("newPassword");
  useEffect(() => {
    const newPassword = passwordForm.getValues("newPassword");
    const result = PasswordSchema.safeParse(newPassword);
    const requirements = {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    };

    if (result.success) {
      requirements.length = true;
      requirements.uppercase = true;
      requirements.lowercase = true;
      requirements.number = true;
      requirements.special = true;
    } else {
      result.error.issues.forEach((issue) => {
        if (issue.path.includes("length")) requirements.length = false;
        if (issue.path.includes("uppercase")) requirements.uppercase = false;
        if (issue.path.includes("lowercase")) requirements.lowercase = false;
        if (issue.path.includes("number")) requirements.number = false;
        if (issue.path.includes("special")) requirements.special = false;
      });

      if (newPassword.length >= 8) requirements.length = true;
      if (/[A-Z]/.test(newPassword)) requirements.uppercase = true;
      if (/[a-z]/.test(newPassword)) requirements.lowercase = true;
      if (/[0-9]/.test(newPassword)) requirements.number = true;
      if (/[^A-Za-z0-9]/.test(newPassword)) requirements.special = true;
    }

    const strength =
      (requirements.length ? 20 : 0) +
      (requirements.uppercase ? 20 : 0) +
      (requirements.lowercase ? 20 : 0) +
      (requirements.number ? 20 : 0) +
      (requirements.special ? 20 : 0);

    setPasswordRequirements(requirements);
    setPasswordStrength(strength);
  }, [passwordForm, watchedNewPassword]);

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-destructive";
    if (passwordStrength < 80) return "bg-amber-500";
    return "bg-green-500";
  };

  if (!user) {
    return null;
  }

  // Handle profile form submission
  async function onProfileSubmit(data: ProfileForm) {
    setIsLoading(true);
    setFormState((prev) => ({
      ...prev,
      error: null,
      success: null,
    }));

    try {
      if (!user) {
        setFormState((prev) => ({
          ...prev,
          error: "User not found. Please log in again.",
        }));
        toast.error("User not found. Please log in again.");
        setIsLoading(false);
        return;
      }
      const response = await fetch(
        `http://localhost:8080/api/users/${userId}/personal`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await logout();
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedUser = await response.json();
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);

      setFormState((prev) => ({
        ...prev,
        success: "Profile updated successfully!",
      }));
      toast.success("Profile updated successfully!");
      setTimeout(() => {
        setFormState((prev) => ({ ...prev, success: null }));
        router.push(`/profile/${userId}`);
      }, 3000);
    } catch (err: any) {
      setFormState((prev) => ({
        ...prev,
        error: err.message || "Failed to update profile. Please try again.",
      }));
      toast.error(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle password form submission
  async function onPasswordSubmit(data: ChangePasswordForm) {
    setIsLoading(true);
    setFormState((prev) => ({
      ...prev,
      passwordError: null,
      passwordSuccess: false,
      success: null,
    }));

    if (passwordStrength < 60) {
      setFormState((prev) => ({
        ...prev,
        passwordError: "Please create a stronger password",
      }));
      toast.error("Please create a stronger password");
      setIsLoading(false);
      return;
    }

    try {
      const res: ChangePasswordResponse = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (!res.success) {
        if (res.status === 401 || res.status === 403) {
          await logout();
          return;
        }
        throw new Error(res.error || "Failed to change password");
      }

      setFormState((prev) => ({
        ...prev,
        passwordSuccess: true,
        success: "Password changed successfully!",
      }));
      toast.success("Password changed successfully!");
      passwordForm.reset();
      setPasswordStrength(0);
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
      setTimeout(() => {
        setFormState((prev) => ({
          ...prev,
          success: null,
          passwordSuccess: false,
        }));
      }, 3000);
    } catch (err: any) {
      setFormState((prev) => ({
        ...prev,
        passwordError:
          err.message || "Failed to change password. Please try again.",
      }));
      toast.error(
        err.message || "Failed to change password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append("image", file);
        const response = await fetch(
          `http://localhost:8080/api/users/upload-image`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            await logout();
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to upload image");
        }

        const result = await response.json();
        const newUser = { ...user, image_url: result.image_url };
        setUser(newUser);
        toast.success("Image uploaded successfully!");
      } catch (err: any) {
        toast.error(err.message || "Failed to upload image. Please try again.");
      }
    }
  };

  const getInitials = () => {
    return `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`;
  };

  return (
    <div className="flex min-h-screen bg-muted/20">
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">
              Update your personal information and profile settings
            </p>
          </div>

          {(formState.error || formState.passwordError) && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {formState.error || formState.passwordError}
              </AlertDescription>
            </Alert>
          )}

          {formState.success && (
            <Alert className="mb-6 border-green-500 text-green-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{formState.success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="personal" className="cursor-pointer">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="settings" className="cursor-pointer">
                Account Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-8"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Picture</CardTitle>
                      <CardDescription>
                        Click on the avatar to upload a new profile picture
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      <div
                        className="relative cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Avatar className="h-32 w-32 border-2 border-primary/10">
                          <AvatarImage
                            src={
                              previewImage ||
                              user.image_url ||
                              "/placeholder.svg?height=128&width=128"
                            }
                            alt={`${user.first_name} ${user.last_name}`}
                          />
                          <AvatarFallback className="text-3xl">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Recommended: Square image, at least 300x300px, max 5MB
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    className="pl-10"
                                    placeholder="John"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    className="pl-10"
                                    placeholder="Doe"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  className="pl-10"
                                  placeholder="john.doe@example.com"
                                  {...field}
                                  disabled
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phone_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  className="pl-10"
                                  placeholder="+1 (555) 123-4567"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Textarea
                                  className="min-h-[80px] pl-10"
                                  placeholder="123 Main St, City, State, ZIP"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Textarea
                                  className="min-h-[80px] pl-10"
                                  placeholder="Tell us about yourself"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="birth_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Birth Date</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    className="pl-10"
                                    type="date"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="nationality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nationality</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Flag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    className="pl-10"
                                    placeholder="American"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/profile/${userId}`)}
                      disabled={isLoading}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <LoadingButton
                      type="submit"
                      disabled={isLoading}
                      loading={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </LoadingButton>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-8"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account settings and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Change Password</h3>
                        <div className="grid gap-4">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      className="pl-10"
                                      type="password"
                                      placeholder="••••••••"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      className="pl-10"
                                      type="password"
                                      placeholder="••••••••"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              Password Strength
                            </div>
                            <Progress
                              value={passwordStrength}
                              className={`h-2 ${getStrengthColor()}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-medium">
                              Requirements
                            </div>
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
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      className="pl-10"
                                      type="password"
                                      placeholder="••••••••"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 pt-6">
                      <LoadingButton
                        type="submit"
                        disabled={isLoading}
                        loading={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Changing Password...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </LoadingButton>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/profile/${userId}`)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
