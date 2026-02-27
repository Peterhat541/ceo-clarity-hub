import { useState } from "react";
import { useUserContext, AppUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import ssIcon from "@/assets/ss-icon.png";

const defaultColors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444"];

export default function UserSelect() {
  const { users, setActiveUser, loadUsers } = useUserContext();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const color = defaultColors[users.length % defaultColors.length];
    const { data, error } = await supabase
      .from("app_users")
      .insert({ name: name.trim(), role: role.trim(), ai_instructions: aiInstructions.trim(), avatar_color: color })
      .select()
      .single();
    if (error) {
      toast({ title: "Error al crear usuario", variant: "destructive" });
    } else {
      await loadUsers();
      setActiveUser(data as AppUser);
    }
    setSaving(false);
  };

  const handleSelect = (user: AppUser) => {
    setActiveUser(user);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <img src={ssIcon} alt="Prossium" className="h-12 w-12 rounded-xl mb-4" />
          <h1 className="text-2xl font-bold text-foreground">¿Quién eres?</h1>
          <p className="text-sm text-muted-foreground mt-1">Selecciona tu perfil para continuar</p>
        </div>

        {!showForm ? (
          <div className="space-y-3">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/60 hover:border-primary/30 transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: user.avatar_color }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role || "Sin rol definido"}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}

            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Crear nuevo usuario</p>
            </button>
          </div>
        ) : (
          <div className="space-y-4 p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Nuevo usuario</h2>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Laura García" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Rol en la empresa</label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ej: Directora de ventas" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">¿Cómo quieres que actúe la IA?</label>
              <textarea
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
                placeholder="Ej: Sé directo, prioriza datos de ventas y oportunidades"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleCreate} disabled={!name.trim() || saving} className="flex-1">
                {saving ? "Creando..." : "Crear y entrar"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
