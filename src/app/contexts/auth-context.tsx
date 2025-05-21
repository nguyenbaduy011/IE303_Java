// contexts/AuthContext.tsx
import { createContext, useContext, useState } from "react";

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  session_id: string;
  passwordChangeRequired: boolean;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
