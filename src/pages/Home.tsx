import { useNavigate } from "react-router-dom";
import { Target, ClipboardList, ArrowLeft } from "lucide-react";
import ParticleNetwork from "@/components/landing/ParticleNetwork";
import logoIcon from "@/assets/prossium-logo.png";
import ssIcon from "@/assets/ss-icon.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      {/* Particle background */}
      <ParticleNetwork />

      {/* Top right button */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          onClick={() => navigate("/landing")}
          className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-foreground/70 hover:text-foreground border border-border/40 hover:border-border/60 rounded-full transition-all backdrop-blur-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Inicio
        </button>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 py-6 sm:p-6">
        {/* Brand block */}
        <div className="flex flex-col items-center mb-4 sm:mb-8">
          <img
            src={logoIcon}
            alt="Prossium"
            className="w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 mb-3 sm:mb-6 object-contain"
          />
          <h1 className="text-[0.65rem] sm:text-sm md:text-base lg:text-lg font-bold tracking-[0.12em] sm:tracking-[0.2em] text-foreground uppercase flex items-center gap-0 leading-none whitespace-nowrap">
            <span>MENOS CONVER</span>
            <img src={ssIcon} alt="SS" className="inline h-[1.2em] w-auto align-middle mx-[0.02em] sm:mx-[0.05em]" />
            <span>ACIONES. MÁS CONTROL</span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-muted-foreground text-sm sm:text-lg">
            Selecciona un modo de trabajo
          </p>
        </div>

        {/* Mode Cards */}
        <div className="flex flex-row gap-3 sm:gap-4 md:gap-6 w-full max-w-[320px] sm:max-w-lg md:max-w-2xl">
          {/* Vista CEO Card */}
          <button
            onClick={() => navigate("/ceo")}
            className="flex-1 group relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl border border-border/20 bg-card/10 backdrop-blur-sm p-3 sm:p-5 md:p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex flex-col items-center text-center gap-1.5 sm:gap-3 md:gap-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Target className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg md:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">
                  VISTA CEO
                </h2>
                <p className="text-muted-foreground text-[0.65rem] sm:text-sm md:text-base">
                  Dashboard ejecutivo
                </p>
              </div>
            </div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Administración Card */}
          <button
            onClick={() => navigate("/admin")}
            className="flex-1 group relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl border border-border/20 bg-card/10 backdrop-blur-sm p-3 sm:p-5 md:p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex flex-col items-center text-center gap-1.5 sm:gap-3 md:gap-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <ClipboardList className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg md:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">
                  ADMINISTRACIÓN
                </h2>
                <p className="text-muted-foreground text-[0.65rem] sm:text-sm md:text-base">
                  Base de datos de clientes
                </p>
              </div>
            </div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </div>
  );
}
