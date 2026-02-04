import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import processiaLogo from "@/assets/processia-logo-new.png";

export function HeaderNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isCEO = location.pathname === "/ceo";
  const isAdmin = location.pathname === "/admin";

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  // Format date
  const formatDate = () => {
    const now = new Date();
    const day = now.getDate();
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${day} ${months[now.getMonth()]}`;
  };

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {/* Logo - clickable to go Home */}
        <img 
          src={processiaLogo} 
          alt="Processia" 
          onClick={() => navigate("/")}
          className="h-7 cursor-pointer hover:opacity-80 transition-opacity" 
        />
        
        {/* Navigation buttons */}
        <div className="flex items-center bg-secondary rounded-full p-1">
          <button
            onClick={() => navigate("/ceo")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              isCEO
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
      
      {/* Date/greeting */}
      <span className="text-sm text-muted-foreground">
        {getGreeting()} · {formatDate()}
      </span>
    </header>
  );
}
