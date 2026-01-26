import { CEOLayout } from "@/components/layout/CEOLayout";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CriticalDate {
  id: string;
  title: string;
  client: string;
  date: string;
  daysUntil: number;
  type: "delivery" | "meeting" | "deadline" | "renewal";
}

const criticalDates: CriticalDate[] = [
  {
    id: "1",
    title: "Entrega proyecto Fase 2",
    client: "Startup Lab",
    date: "28 Enero 2026",
    daysUntil: 2,
    type: "delivery",
  },
  {
    id: "2",
    title: "Reunión de seguimiento trimestral",
    client: "BlueSky Ventures",
    date: "30 Enero 2026",
    daysUntil: 4,
    type: "meeting",
  },
  {
    id: "3",
    title: "Renovación de contrato",
    client: "CoreData",
    date: "5 Febrero 2026",
    daysUntil: 10,
    type: "renewal",
  },
  {
    id: "4",
    title: "Deadline propuesta comercial",
    client: "New Client Inc",
    date: "7 Febrero 2026",
    daysUntil: 12,
    type: "deadline",
  },
  {
    id: "5",
    title: "Entrega auditoría de seguridad",
    client: "TechFlow Solutions",
    date: "15 Febrero 2026",
    daysUntil: 20,
    type: "delivery",
  },
];

const getUrgencyColor = (days: number) => {
  if (days <= 2) return "text-status-red bg-status-red/20";
  if (days <= 5) return "text-status-orange bg-status-orange/20";
  if (days <= 10) return "text-status-yellow bg-status-yellow/20";
  return "text-muted-foreground bg-secondary";
};

const getTypeLabel = (type: CriticalDate["type"]) => {
  const labels = {
    delivery: "Entrega",
    meeting: "Reunión",
    deadline: "Deadline",
    renewal: "Renovación",
  };
  return labels[type];
};

export default function Fechas() {
  const urgentDates = criticalDates.filter((d) => d.daysUntil <= 5);
  const upcomingDates = criticalDates.filter((d) => d.daysUntil > 5);

  return (
    <CEOLayout>
      <div className="max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Fechas críticas
          </h1>
          <p className="text-muted-foreground">
            Próximos hitos y deadlines importantes
          </p>
        </div>

        {/* Urgent dates */}
        {urgentDates.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-status-orange" />
              <h2 className="text-lg font-semibold text-foreground">
                Esta semana
              </h2>
            </div>
            <div className="space-y-3">
              {urgentDates.map((date) => (
                <DateCard key={date.id} {...date} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming dates */}
        {upcomingDates.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                Próximamente
              </h2>
            </div>
            <div className="space-y-3">
              {upcomingDates.map((date) => (
                <DateCard key={date.id} {...date} />
              ))}
            </div>
          </section>
        )}
      </div>
    </CEOLayout>
  );
}

function DateCard({ title, client, date, daysUntil, type }: CriticalDate) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer">
      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
        daysUntil <= 2 ? "bg-status-orange/20" : "bg-secondary"
      )}>
        <Calendar className={cn(
          "w-6 h-6",
          daysUntil <= 2 ? "text-status-orange" : "text-muted-foreground"
        )} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-foreground">{title}</span>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
            {getTypeLabel(type)}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{client}</span>
          <span>•</span>
          <span>{date}</span>
        </div>
      </div>

      <span className={cn(
        "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5",
        getUrgencyColor(daysUntil)
      )}>
        <Clock className="w-3.5 h-3.5" />
        {daysUntil}d
      </span>
    </div>
  );
}
