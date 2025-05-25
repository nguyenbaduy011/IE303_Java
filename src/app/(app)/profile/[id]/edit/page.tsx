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
  Shield,
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
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import LoadingButton from "@/components/ui/loading-button";
import { useAuth } from "@/contexts/auth-context";
import {
  profileFormSchema,
  changePasswordFormSchema,
  ProfileForm,
  ChangePasswordForm,
} from "@/lib/validations";
import { toast } from "sonner";

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

  // Initialize password form
  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

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
      setTimeout(() => {
        setFormState((prev) => ({ ...prev, success: null }));
        router.push(`/profile/${userId}`);
      }, 3000);
    } catch (err: any) {
      setFormState((prev) => ({
        ...prev,
        error: err.message || "Failed to update profile. Please try again.",
      }));
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

    try {
      const response = await fetch(
        `http://localhost:8080/api/users/change-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await logout();
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      setFormState((prev) => ({
        ...prev,
        passwordSuccess: true,
        success: "Password changed successfully!",
      }));
      toast.success("Password changed successfully!");
      passwordForm.reset();
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
    } finally {
      setIsLoading(false);
    }
  }

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(file);
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
                                    <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                                    <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                          <LoadingButton
                            type="submit"
                            disabled={isLoading}
                            loading={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Changing Password...
                              </>
                            ) : (
                              <>
                                <Shield className="mr-2 h-4 w-4" />
                                Change Password
                              </>
                            )}
                          </LoadingButton>
                        </div>
                      </div>
                    </CardContent>
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
