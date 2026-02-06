import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import landingBg from "@/assets/landing-bg.png";
import landingHero from "@/assets/landing-hero.png";
import landingSubtitle from "@/assets/landing-subtitle.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Capa 0: Fondo oscuro con globo */}
      <img
        src={landingBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Capas 1 y 2: Hero + Subtítulo centrados */}
      <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center px-4">
        {/* Hero: Logo + slogan */}
        <img
          src={landingHero}
          alt="Processia - Menos conversaciones. Más control."
          className="w-auto max-w-[90%] md:max-w-[65%] lg:max-w-[55%] h-auto"
          style={{ mixBlendMode: "screen" }}
        />

        {/* Subtítulo */}
        <img
          src={landingSubtitle}
          alt="Sistemas internos a medida para CEOs"
          className="w-auto max-w-[70%] md:max-w-[45%] lg:max-w-[35%] h-auto mt-6"
          style={{ mixBlendMode: "screen" }}
        />
      </div>

      {/* Botón Entrar */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-full transition-all backdrop-blur-sm"
        >
          Entrar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
