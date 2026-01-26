import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export function ViewSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAdmin = location.pathname === "/admin";

  return (
    <div className="h-12 border-t border-border bg-background flex items-center justify-center">
      <div className="flex items-center bg-secondary rounded-full p-1">
        <button
          onClick={() => navigate("/")}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
            !isAdmin
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          Vista CEO
        </button>
        <button
          onClick={() => navigate("/admin")}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
            isAdmin
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Database className="w-4 h-4" />
          Administración
        </button>
      </div>
    </div>
  );
}
