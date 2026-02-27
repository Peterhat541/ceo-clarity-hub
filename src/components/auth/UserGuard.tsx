import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useUserContext } from "@/contexts/UserContext";

export function UserGuard({ children }: { children: ReactNode }) {
  const { activeUser, isLoading } = useUserContext();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!activeUser) {
    return <Navigate to="/select-user" replace />;
  }

  return <>{children}</>;
}
