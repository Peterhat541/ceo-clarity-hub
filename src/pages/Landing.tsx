import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import landingComplete from "@/assets/landing-complete.png";

export default function Landing() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAccess = async () => {
    if (!code.trim()) {
      setError("Introduce el código de acceso");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: dbError } = await supabase
        .from("demo_access_codes" as any)
        .select("code")
        .eq("code", code.trim())
        .eq("is_active", true)
        .maybeSingle();

      if (dbError || !data) {
        setError("Código incorrecto");
        setLoading(false);
        return;
      }

      // Log the access
      await supabase.from("demo_access_logs" as any).insert({
        access_code: code.trim(),
        user_agent: navigator.userAgent,
      });

      sessionStorage.setItem("demo_access", "true");
      navigate("/");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

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

      {/* Formulario de acceso */}
      <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 w-full max-w-xs">
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAccess()}
              placeholder="Código de acceso"
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-white/50 backdrop-blur-sm"
            />
          </div>
          <button
            onClick={handleAccess}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-black bg-white hover:bg-white/90 rounded-full transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Acceder <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}
      </div>
    </div>
  );
}
