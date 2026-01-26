import { ReactNode } from "react";
import { AIChat } from "@/components/ai/AIChat";
import { Sidebar } from "@/components/layout/Sidebar";

interface CEOLayoutProps {
  children: ReactNode;
}

export function CEOLayout({ children }: CEOLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex flex-1">
        {/* Left panel - Dynamic content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        
        {/* Right panel - AI Chat (always visible) */}
        <aside className="w-[420px] border-l border-border bg-card flex flex-col">
          <AIChat />
        </aside>
      </div>
    </div>
  );
}
