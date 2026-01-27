import { Bot, MessageCircle } from "lucide-react";

interface AIHeroCardProps {
  onTalkClick: () => void;
}

export function AIHeroCard({ onTalkClick }: AIHeroCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-accent p-6 shadow-xl">
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" />
      
      <div className="relative flex flex-col items-center text-center">
        {/* AI Icon */}
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <Bot className="h-10 w-10 text-white" />
        </div>
        
        {/* Message */}
        <h2 className="mb-2 text-xl font-semibold text-white">
          Cuéntame, ¿qué necesitas?
        </h2>
        <p className="mb-6 text-sm text-white/80">
          Estoy aquí para ayudarte con cualquier cosa
        </p>
        
        {/* Talk Button */}
        <button
          onClick={onTalkClick}
          className="flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-primary shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
        >
          <MessageCircle className="h-5 w-5" />
          Hablar
        </button>
      </div>
    </div>
  );
}
