import { useNavigate } from "react-router-dom";
import { Target, ClipboardList, ArrowLeft } from "lucide-react";
import ParticleNetwork from "@/components/landing/ParticleNetwork";
import logoSlogan from "@/assets/logo-slogan.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      {/* Particle background */}
      <ParticleNetwork />

      {/* Top right button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => navigate("/landing")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-full transition-all backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Inicio
        </button>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6">
        {/* Logo + Slogan combined image */}
        <div className="mb-8">
          <img
            src={logoSlogan}
            alt="Processia - Menos conversaciones. Más control."
            className="w-[70vw] max-w-[500px] sm:max-w-[550px] md:max-w-[600px] object-contain"
            style={{ mixBlendMode: "screen" }}
          />
        </div>

        {/* Subtitle */}
        <div className="text-center mb-12">
          <p className="text-white/60 text-lg">
            Selecciona un modo de trabajo
          </p>
        </div>

        {/* Mode Cards */}
        <div className="flex flex-row gap-4 w-full max-w-2xl px-4 sm:gap-6 sm:px-0">
          {/* Vista CEO Card */}
          <button
            onClick={() => navigate("/ceo")}
            className="flex-1 group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-8 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <div className="flex flex-col items-center text-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <Target className="w-5 h-5 sm:w-8 sm:h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-2xl font-bold text-white mb-1">
                  VISTA CEO
                </h2>
                <p className="text-white/50 text-xs sm:text-base">
                  Dashboard ejecutivo
                </p>
              </div>
            </div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Administración Card */}
          <button
            onClick={() => navigate("/admin")}
            className="flex-1 group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-8 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <div className="flex flex-col items-center text-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <ClipboardList className="w-5 h-5 sm:w-8 sm:h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-2xl font-bold text-white mb-1">
                  ADMINISTRACIÓN
                </h2>
                <p className="text-white/50 text-xs sm:text-base">
                  Base de datos de clientes
                </p>
              </div>
            </div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </div>
  );
}
