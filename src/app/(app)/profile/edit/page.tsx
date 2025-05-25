"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
  FormDescription,
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
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import LoadingButton from "@/components/ui/loading-button";
import { useAuth } from "@/contexts/auth-context";

// Form schema for validation
const profileFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  nationality: z.string().optional(),
  gender: z.enum(["male", "female"], {
    required_error: "Gender is required",
  }),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Kiểm tra user từ AuthContext
  if (!user) {
    router.push("/login");
    return null;
  }

  // Initialize form with user data from AuthContext
  const defaultValues: Partial<ProfileFormValues> = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone_number: user.phone_number || "",
    address: user.address || "",
    birth_date: new Date(user.birth_date).toISOString().split("T")[0],
    nationality: user.nationality || "",
    gender:
      user.gender === "male" || user.gender === "female"
        ? user.gender
        : undefined,
    bio: "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      // Cập nhật thông tin cá nhân
      const response = await fetch(
        `http://localhost:8080/api/users/${user.id}/personal`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone_number: data.phone_number,
            address: data.address,
            birth_date: data.birth_date,
            nationality: data.nationality,
            gender: data.gender,
            bio: data.bio,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem("user");
          setUser(null);
          router.push("/login");
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      // Cập nhật AuthContext và sessionStorage
      const newUser = {
        ...user,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        phone_number: updatedUser.phone_number,
        address: updatedUser.address,
        birth_date: updatedUser.birth_date,
        nationality: updatedUser.nationality,
        gender: updatedUser.gender,
      };
      setUser(newUser);
      sessionStorage.setItem("user", JSON.stringify(newUser));

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push(`/profiles/${user.id}`);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile. Please try again.");
      setIsLoading(false);
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const response = await fetch(
      `http://localhost:8080/api/users/change-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      }
    );
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("user");
        setUser(null);
        router.push("/login");
        throw new Error("Session expired. Please log in again.");
      }
      throw new Error("Failed to change password");
    }
  }

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Hiển thị preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Tải ảnh lên server
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
            sessionStorage.removeItem("user");
            setUser(null);
            router.push("/login");
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error("Failed to upload image");
        }

        const result = await response.json();
        // Cập nhật image_url trong AuthContext và sessionStorage
        const newUser = { ...user, image_url: result.image_url };
        setUser(newUser);
        sessionStorage.setItem("user", JSON.stringify(newUser));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || "Failed to upload image. Please try again.");
      }
    }
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
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

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-500 text-green-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your profile has been updated successfully!
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="settings">Account Settings</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <TabsContent value="personal" className="space-y-6">
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
                        onClick={handleImageClick}
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
                        Recommended: Square image, at least 300x300px
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
                          control={form.control}
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
                          control={form.control}
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
                        control={form.control}
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
                        control={form.control}
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
                        control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                className="min-h-[120px]"
                                placeholder="Tell us about yourself..."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A brief description about yourself that will be
                              visible on your profile.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
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
                          <div className="grid gap-2">
                            <Label htmlFor="current-password">
                              Current Password
                            </Label>
                            <div className="relative">
                              <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="current-password"
                                type="password"
                                className="pl-10"
                                placeholder="••••••••"
                              />
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                              <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="new-password"
                                type="password"
                                className="pl-10"
                                placeholder="••••••••"
                              />
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="confirm-password">
                              Confirm New Password
                            </Label>
                            <div className="relative">
                              <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="confirm-password"
                                type="password"
                                className="pl-10"
                                placeholder="••••••••"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full md:w-auto"
                          >
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/profiles/${user.id}`)}
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
          </Tabs>
        </div>
      </main>
    </div>
  );
}
