import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import landingHero from "@/assets/landing-hero.png";
import ParticleNetwork from "@/components/landing/ParticleNetwork";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Animated particle background */}
      <ParticleNetwork />

      {/* Top right button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-full transition-all backdrop-blur-sm"
        >
          Entrar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Centered content - just the image */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <img 
          src={landingHero} 
          alt="Processia - Menos conversaciones. Más control. Sistemas internos a medida para CEOs" 
          className="max-w-full max-h-[80vh] object-contain"
        />
      </div>
    </div>
  );
}
