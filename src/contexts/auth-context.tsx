// contexts/auth-context.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/api/logout/route";
import { checkSession } from "@/api/check-session/route";
import Loading from "@/components/loading";

export type UserType = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  sessionId: string;
  passwordChangeRequired: boolean;
  hire_date: string;
  birth_date: string;
  gender: string;
  nationality: string;
  image_url: string | null;
  phone_number: string;
  address: string;
  role: {
    id: string;
    name: string;
    description?: string;
    permissions: Array<{
      id: string;
      name: string;
      description?: string;
    }>;
  };
  department?: {
    id: string;
    name: string;
  };
  position?: {
    id: string;
    name: string;
  };
  team?: {
    id: string;
    name: string;
  };
  working_status: string;
  salary: number;
};

type AuthContextType = {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Hàm lấy giá trị cookie
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  // Hàm logout: gọi API và xóa sessionStorage
  const logout = async () => {
    try {
      const result = await logoutUser(); // logoutUser đã xóa cookie
      if (!result.success) {
        console.warn("Logout thất bại:", result.error);
      }
    } catch (error) {
      console.error("Lỗi khi logout:", error);
    } finally {
      sessionStorage.removeItem("user"); // Xóa sessionStorage
      setUser(null);
      setIsAuthenticated(false);
      router.push("/login");
    }
  };

  // Khôi phục session khi load trang
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const userCookie = getCookie("user");
        if (!userCookie) {
          throw new Error("Không tìm thấy cookie user");
        }

        const parsedUser: UserType = JSON.parse(decodeURIComponent(userCookie));
        if (!parsedUser.id || !parsedUser.email || !parsedUser.sessionId) {
          throw new Error("Dữ liệu user trong cookie không hợp lệ");
        }

        const result = await checkSession({ id: parsedUser.id });
        if (result.isValid) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          throw new Error(result.error || "Session không hợp lệ");
        }
      } catch (error) {
        console.error("Lỗi khi khôi phục session:", error);
        // Xóa cookie nếu session không hợp lệ
        document.cookie = `user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
        document.cookie = `session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
        document.cookie = `SOCIUS_SESSION=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
        document.cookie = `XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
        sessionStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
