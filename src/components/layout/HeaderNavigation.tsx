import { useNavigate, useLocation } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
import prossiumLogo from "@/assets/prossium-logo.png";
import { useIsMobile } from "@/hooks/use-mobile";

export function HeaderNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isAdmin = location.pathname === "/admin";

  if (isMobile) {
    return (
      <header className="shrink-0 border-b border-border/50 bg-card/30 backdrop-blur-sm safe-area-top">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <img src={prossiumLogo} alt="Prossium" className="h-6" />
            <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">IA activa</span>
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
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <img 
          src={prossiumLogo} 
          alt="Prossium" 
          className="h-7 cursor-pointer" 
          onClick={() => navigate("/")}
        />
        <div className="h-5 w-px bg-border/50" />
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">IA activa para tu empresa</span>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            isAdmin
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
          title="Configuración"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden lg:inline">Configuración</span>
        </button>
        <button
          onClick={() => {
            sessionStorage.removeItem("demo_access");
            navigate("/landing");
          }}
          className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-destructive border border-border hover:border-destructive/50 rounded-full transition-all"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>
    </header>
  );
}
