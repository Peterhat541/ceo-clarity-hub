import { ReactNode } from "react";
import { AIChat } from "@/components/ai/AIChat";
import { ViewSwitcher } from "@/components/layout/ViewSwitcher";
import { TopNavigation } from "@/components/layout/TopNavigation";

interface CEOLayoutProps {
  children: ReactNode;
}

export function CEOLayout({ children }: CEOLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Top Navigation - simplified */}
        <TopNavigation />
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Dynamic content */}
          <main className="flex-1 p-6 overflow-hidden">
            {children}
          </main>
          
          {/* Right panel - AI Chat (always visible) */}
          <aside className="w-[420px] border-l border-border bg-card flex flex-col">
            <AIChat />
          </aside>
        </div>
        
        {/* Bottom View Switcher */}
        <ViewSwitcher />
      </div>
    </div>
  );
}
