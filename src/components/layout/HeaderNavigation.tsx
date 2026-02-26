import { useNavigate, useLocation } from "react-router-dom";
import { Settings, LogOut, Sparkles } from "lucide-react";
import ssIcon from "@/assets/ss-icon.png";
import { useIsMobile } from "@/hooks/use-mobile";

export function HeaderNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isAdmin = location.pathname === "/admin";

  if (isMobile) {
    return (
      <header className="shrink-0 border-b border-border/50 bg-sidebar-background/80 backdrop-blur-sm safe-area-top">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <img src={ssIcon} alt="Prossium" className="h-6 w-6 rounded-lg" />
            <span className="font-semibold text-sm text-foreground">Prossium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate("/admin")}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                isAdmin
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
              title="Configuración"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem("demo_access");
                navigate("/landing");
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              title="Salir"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border/50 bg-sidebar-background/80 backdrop-blur-sm">
      {/* Left: Logo + Brand */}
      <div className="flex items-center gap-3">
        <img 
          src={ssIcon} 
          alt="Prossium" 
          className="h-8 w-8 rounded-lg cursor-pointer" 
          onClick={() => navigate("/")}
        />
        <span className="font-bold text-foreground tracking-tight">Prossium</span>
      </div>
      
      {/* Center: Status pill */}
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-muted-foreground">IA activa para <span className="text-foreground font-medium">Agencia Nexus</span></span>
      </div>
      
      {/* Right: TU IA button + User + Settings */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 transition-all">
          <Sparkles className="w-3.5 h-3.5" />
          TU IA
        </button>
        <span className="text-sm text-muted-foreground hidden lg:inline">Carlos Ruiz</span>
        <button
          onClick={() => navigate("/admin")}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
            isAdmin
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
          title="Configuración"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            sessionStorage.removeItem("demo_access");
            navigate("/landing");
          }}
          className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          title="Salir"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
