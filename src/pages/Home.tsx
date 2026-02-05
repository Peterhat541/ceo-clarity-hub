import { useNavigate } from "react-router-dom";
import { Target, ClipboardList, ArrowLeft } from "lucide-react";
import processiaLogo from "@/assets/processia-logo-new.png";
import sloganImage from "@/assets/slogan.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col relative p-6">
      {/* Top right button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => navigate("/landing")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:border-primary/50 rounded-full transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Inicio
        </button>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center">
      {/* Logo - Large and prominent */}
      <div className="mb-8">
        <img 
          src={processiaLogo} 
          alt="Processia" 
          className="h-24 object-contain"
        />
      </div>

      {/* Slogan + Subtitle */}
      <div className="text-center mb-12">
        <img 
          src={sloganImage} 
          alt="Menos conversaciones. Más control." 
          className="h-12 sm:h-16 md:h-20 object-contain mb-4"
        />
        <p className="text-muted-foreground text-lg">
          Selecciona un modo de trabajo
        </p>
      </div>

      {/* Mode Cards */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
        {/* Vista CEO Card */}
        <button
          onClick={() => navigate("/ceo")}
          className="flex-1 group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                VISTA CEO
              </h2>
              <p className="text-muted-foreground">
                Dashboard ejecutivo
              </p>
            </div>
          </div>
          
          {/* Hover glow effect */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Administración Card */}
        <button
          onClick={() => navigate("/admin")}
          className="flex-1 group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                ADMINISTRACIÓN
              </h2>
              <p className="text-muted-foreground">
                Base de datos de clientes
              </p>
            </div>
          </div>
          
          {/* Hover glow effect */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
      </div>
    </div>
  );
}
