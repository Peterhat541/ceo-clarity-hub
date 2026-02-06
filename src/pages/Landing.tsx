import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import landingComplete from "@/assets/landing-complete.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Imagen completa de la landing con bordes difuminados */}
      <img
        src={landingComplete}
        alt="Processia - Menos conversaciones. Más control."
        className="w-full h-full object-contain absolute inset-0"
        style={{
          maskImage: "radial-gradient(ellipse 80% 80% at center, black 50%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at center, black 50%, transparent 100%)",
        }}
      />

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
