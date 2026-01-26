import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  Calendar,
  Settings,
  Building2
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Hoy", path: "/" },
  { icon: AlertTriangle, label: "Incidencias", path: "/incidencias" },
  { icon: Users, label: "Clientes en rojo", path: "/clientes-rojo" },
  { icon: Calendar, label: "Fechas críticas", path: "/fechas" },
];

const adminItems = [
  { icon: Building2, label: "Administración", path: "/admin" },
  { icon: Settings, label: "Configuración", path: "/config" },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-teal flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">P</span>
          </div>
          <span className="text-xl font-semibold text-foreground">Processia</span>
        </div>
      </div>

      {/* CEO Navigation */}
      <nav className="flex-1 p-4">
        <div className="mb-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Vista CEO
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Admin Section */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Equipo
          </p>
          <ul className="space-y-1">
            {adminItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-teal flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-foreground">C</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">CEO</p>
            <p className="text-xs text-muted-foreground truncate">Vista ejecutiva</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
