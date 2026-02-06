import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import landingBg from "@/assets/landing-bg.png";
import ParticleNetwork from "@/components/landing/ParticleNetwork";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Full-screen background image */}
      <img
        src={landingBg}
        alt="Processia - Menos conversaciones. Más control."
        className="absolute inset-0 w-full h-full object-contain z-0"
      />

      {/* Animated particle overlay */}
      <ParticleNetwork />

      {/* Top right button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black/70 hover:text-black border border-black/20 hover:border-black/40 rounded-full transition-all backdrop-blur-sm"
        >
          Entrar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
