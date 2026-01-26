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
        
        {/* Content - Two column layout, edge to edge */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Dynamic content - no padding, fills space */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          
          {/* Right panel - AI Chat - directly adjacent */}
          <aside className="w-[380px] border-l border-border bg-card flex flex-col shrink-0">
            <AIChat />
          </aside>
        </div>
        
        {/* Bottom View Switcher */}
        <ViewSwitcher />
      </div>
    </div>
  );
}
