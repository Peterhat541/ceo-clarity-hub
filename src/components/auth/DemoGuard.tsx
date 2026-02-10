import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface DemoGuardProps {
  children: ReactNode;
}

export function DemoGuard({ children }: DemoGuardProps) {
  const hasAccess = sessionStorage.getItem("demo_access");
  
  if (!hasAccess) {
    return <Navigate to="/landing" replace />;
  }
  
  return <>{children}</>;
}
