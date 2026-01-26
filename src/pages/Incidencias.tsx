import { CEOLayout } from "@/components/layout/CEOLayout";
import { IncidentRow } from "@/components/dashboard/IncidentRow";
import { AlertTriangle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const allIncidents = [
  {
    clientName: "Nexus Tech",
    description: "Error en la facturación del mes de enero - cliente esperando resolución",
    status: "red" as const,
    daysOpen: 3,
  },
  {
    clientName: "Global Media",
    description: "Cambio de alcance solicitado por el cliente - pendiente de valorar",
    status: "orange" as const,
    daysOpen: 1,
  },
  {
    clientName: "CoreData",
    description: "Retraso en entrega de contenidos por parte del cliente",
    status: "yellow" as const,
    daysOpen: 5,
  },
  {
    clientName: "BlueSky Ventures",
    description: "Solicitud de funcionalidad adicional fuera de alcance",
    status: "yellow" as const,
    daysOpen: 2,
  },
  {
    clientName: "TechFlow Solutions",
    description: "Bug reportado en módulo de reportes - en investigación",
    status: "green" as const,
    daysOpen: 1,
  },
];

export default function Incidencias() {
  return (
    <CEOLayout>
      <div className="max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Incidencias
            </h1>
            <p className="text-muted-foreground">
              {allIncidents.length} incidencias activas en total
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-status-red/10 border border-status-red/30">
            <p className="text-2xl font-bold text-status-red">1</p>
            <p className="text-sm text-foreground">Críticas</p>
          </div>
          <div className="p-4 rounded-xl bg-status-orange/10 border border-status-orange/30">
            <p className="text-2xl font-bold text-status-orange">1</p>
            <p className="text-sm text-foreground">En riesgo</p>
          </div>
          <div className="p-4 rounded-xl bg-status-yellow/10 border border-status-yellow/30">
            <p className="text-2xl font-bold text-status-yellow">2</p>
            <p className="text-sm text-foreground">Atención</p>
          </div>
          <div className="p-4 rounded-xl bg-status-green/10 border border-status-green/30">
            <p className="text-2xl font-bold text-status-green">1</p>
            <p className="text-sm text-foreground">Controladas</p>
          </div>
        </div>

        {/* Incident List */}
        <div className="space-y-3">
          {allIncidents.map((incident, index) => (
            <IncidentRow key={index} {...incident} />
          ))}
        </div>
      </div>
    </CEOLayout>
  );
}
