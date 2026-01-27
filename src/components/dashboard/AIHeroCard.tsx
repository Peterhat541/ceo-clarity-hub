import { Bot, MessageCircle } from "lucide-react";

interface AIHeroCardProps {
  onTalkClick: () => void;
}

export function AIHeroCard({ onTalkClick }: AIHeroCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-accent p-4 shadow-lg">
      {/* Background decoration */}
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
      <div className="absolute -bottom-3 -left-3 h-16 w-16 rounded-full bg-white/5" />
      
      <div className="relative flex items-center gap-4">
        {/* AI Icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <Bot className="h-7 w-7 text-white" />
        </div>
        
        {/* Message */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-white">
            ¿Qué necesitas?
          </h2>
          <p className="text-xs text-white/80 truncate">
            Estoy aquí para ayudarte
          </p>
        </div>
        
        {/* Talk Button */}
        <button
          onClick={onTalkClick}
          className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-md transition-all hover:scale-105 active:scale-95"
        >
          <MessageCircle className="h-4 w-4" />
          Hablar
        </button>
      </div>
    </div>
  );
}
