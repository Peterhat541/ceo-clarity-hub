import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import processiaLogo from "@/assets/processia-logo-new.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top right button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-full transition-all"
        >
          Entrar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src={processiaLogo} 
            alt="Processia" 
            className="h-20 sm:h-24 md:h-28 object-contain"
          />
        </div>

        {/* Slogan with highlighted SS */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide mb-4 text-center">
          MENOS CONVER<span className="text-primary">S</span>ACIONE<span className="text-primary">S</span>. MÁS CONTROL
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl font-medium text-primary tracking-wider text-center">
          SISTEMAS INTERNOS A MEDIDA PARA CEOS
        </p>
      </div>
    </div>
  );
}
