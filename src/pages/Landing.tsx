import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import ParticleNetwork from "@/components/landing/ParticleNetwork";
import ssLogo from "@/assets/ss-logo-new.png";

export default function Landing() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [code, setCode] = useState("DEMO2026");
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
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Particle background */}
      <ParticleNetwork />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-2xl w-full">
        {/* Logo */}
        <img
          src={ssLogo}
          alt="Prossium"
          className={isMobile ? "w-28 h-auto" : "w-40 h-auto"}
        />

        {/* Headline */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1
            className={`font-bold tracking-tight text-white leading-tight ${
              isMobile ? "text-2xl" : "text-4xl"
            }`}
          >
            Menos conversaciones.{" "}
            <span className="text-primary">Más control.</span>
          </h1>
          <p
            className={`text-white/50 font-light ${
              isMobile ? "text-sm" : "text-lg"
            }`}
          >
            ¿Y si tu negocio tuviera su propia inteligencia artificial?
          </p>
        </div>

        {/* Access form */}
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAccess()}
                placeholder="Código de acceso"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <button
              onClick={handleAccess}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-black bg-primary hover:bg-primary/90 rounded-full transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Acceder <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
      </div>

      {/* Safe area padding for mobile */}
      <div
        className="pb-[env(safe-area-inset-bottom,0px)]"
        style={{ minHeight: "1px" }}
      />
    </div>
  );
}
