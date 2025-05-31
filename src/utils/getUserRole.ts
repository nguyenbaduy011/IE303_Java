import { useAuth } from "@/contexts/auth-context";

export const GetUserRole = () => {
  const { user } = useAuth();
  return user?.role.name;
};
