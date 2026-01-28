import { useState, useEffect } from "react";
import { Columns3, Check, RotateCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export interface ColumnConfig {
  key: string;
  label: string;
  defaultVisible: boolean;
}

const STORAGE_KEY = "admin-table-columns";

export const defaultColumns: ColumnConfig[] = [
  { key: "status", label: "Estado", defaultVisible: true },
  { key: "name", label: "Cliente", defaultVisible: true },
  { key: "contact_name", label: "Contacto", defaultVisible: true },
  { key: "email", label: "Email", defaultVisible: true },
  { key: "phone", label: "Teléfono", defaultVisible: true },
  { key: "project_type", label: "Tipo proyecto", defaultVisible: true },
  { key: "work_description", label: "Descripción", defaultVisible: false },
  { key: "budget", label: "Presupuesto", defaultVisible: false },
  { key: "project_dates", label: "Fechas", defaultVisible: false },
  { key: "project_manager", label: "Responsable", defaultVisible: true },
  { key: "pending_tasks", label: "Tareas pend.", defaultVisible: true },
  { key: "incidents", label: "Incidencias", defaultVisible: true },
  { key: "last_contact", label: "Último contacto", defaultVisible: true },
  { key: "actions", label: "Acciones", defaultVisible: true },
];

export function useColumnVisibility() {
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getDefaultVisibility();
      }
    }
    return getDefaultVisibility();
  });

  function getDefaultVisibility(): Record<string, boolean> {
    return defaultColumns.reduce((acc, col) => {
      acc[col.key] = col.defaultVisible;
      return acc;
    }, {} as Record<string, boolean>);
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const showAll = () => {
    setVisibleColumns(
      defaultColumns.reduce((acc, col) => {
        acc[col.key] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );
  };

  const resetToDefault = () => {
    setVisibleColumns(getDefaultVisibility());
  };

  const isColumnVisible = (key: string) => visibleColumns[key] !== false;

  return {
    visibleColumns,
    toggleColumn,
    showAll,
    resetToDefault,
    isColumnVisible,
  };
}

interface ColumnVisibilityToggleProps {
  visibleColumns: Record<string, boolean>;
  toggleColumn: (key: string) => void;
  showAll: () => void;
  resetToDefault: () => void;
}

export function ColumnVisibilityToggle({
  visibleColumns,
  toggleColumn,
  showAll,
  resetToDefault,
}: ColumnVisibilityToggleProps) {
  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Columns3 className="w-4 h-4" />
          Columnas
          <span className="text-xs text-muted-foreground">({visibleCount})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Mostrar/ocultar columnas
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {defaultColumns.map((col) => (
          <DropdownMenuItem
            key={col.key}
            onClick={(e) => {
              e.preventDefault();
              toggleColumn(col.key);
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              {visibleColumns[col.key] !== false && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </div>
            <span className={visibleColumns[col.key] === false ? "text-muted-foreground" : ""}>
              {col.label}
            </span>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={showAll} className="gap-2 cursor-pointer">
          <Eye className="w-4 h-4" />
          Mostrar todas
        </DropdownMenuItem>
        <DropdownMenuItem onClick={resetToDefault} className="gap-2 cursor-pointer">
          <RotateCcw className="w-4 h-4" />
          Restablecer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
