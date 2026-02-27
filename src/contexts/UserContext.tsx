import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AppUser {
  id: string;
  name: string;
  role: string;
  ai_instructions: string;
  avatar_color: string;
  created_at: string;
}

interface UserContextType {
  activeUser: AppUser | null;
  setActiveUser: (user: AppUser | null) => void;
  users: AppUser[];
  loadUsers: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [activeUser, setActiveUserState] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const setActiveUser = (user: AppUser | null) => {
    setActiveUserState(user);
    if (user) {
      sessionStorage.setItem("active_user_id", user.id);
    } else {
      sessionStorage.removeItem("active_user_id");
    }
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from("app_users")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setUsers(data as AppUser[]);
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadUsers();
      const savedId = sessionStorage.getItem("active_user_id");
      if (savedId) {
        const { data } = await supabase
          .from("app_users")
          .select("*")
          .eq("id", savedId)
          .maybeSingle();
        if (data) setActiveUserState(data as AppUser);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  return (
    <UserContext.Provider value={{ activeUser, setActiveUser, users, loadUsers, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserContext must be used within UserProvider");
  return context;
}
