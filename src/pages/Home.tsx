import { useNavigate } from "react-router-dom";
import { Target, ClipboardList } from "lucide-react";
import processiaLogo from "@/assets/processia-logo-new.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8">
        <img 
          src={processiaLogo} 
          alt="Processia" 
          className="h-12 object-contain"
        />
      </div>

      {/* Greeting */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Hola, Juan 👋
        </h1>
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
  );
}
