import { useRef, useEffect, useCallback, ReactNode } from "react";

interface DualScrollTableProps {
  children: ReactNode;
  className?: string;
}

export function DualScrollTable({ children, className = "" }: DualScrollTableProps) {
  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  const syncScroll = useCallback((source: "top" | "bottom") => {
    if (isSyncing.current) return;
    
    isSyncing.current = true;
    
    const top = topScrollRef.current;
    const bottom = bottomScrollRef.current;
    
    if (!top || !bottom) {
      isSyncing.current = false;
      return;
    }

    if (source === "top") {
      bottom.scrollLeft = top.scrollLeft;
    } else {
      top.scrollLeft = bottom.scrollLeft;
    }

    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  }, []);

  useEffect(() => {
    const updateTopScrollWidth = () => {
      if (contentRef.current && topScrollRef.current) {
        const contentWidth = contentRef.current.scrollWidth;
        const spacer = topScrollRef.current.querySelector(".scroll-spacer") as HTMLElement;
        if (spacer) {
          spacer.style.width = `${contentWidth}px`;
        }
      }
    };

    // Initial update with a small delay to ensure content is rendered
    const timer = setTimeout(updateTopScrollWidth, 100);

    const resizeObserver = new ResizeObserver(updateTopScrollWidth);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    // Also observe mutations for dynamic content
    const mutationObserver = new MutationObserver(updateTopScrollWidth);
    if (contentRef.current) {
      mutationObserver.observe(contentRef.current, { 
        childList: true, 
        subtree: true 
      });
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <div className={className}>
      {/* Top scroll bar - more visible */}
      <div
        ref={topScrollRef}
        onScroll={() => syncScroll("top")}
        className="overflow-x-auto overflow-y-hidden border-b border-border bg-secondary/50 rounded-t-xl"
        style={{ 
          scrollbarWidth: "auto",
          height: "14px",
        }}
      >
        <div 
          className="scroll-spacer" 
          style={{ height: "1px" }}
        />
      </div>

      {/* Table container with bottom scroll */}
      <div
        ref={(el) => {
          bottomScrollRef.current = el;
          contentRef.current = el;
        }}
        onScroll={() => syncScroll("bottom")}
        className="overflow-x-auto"
      >
        {children}
      </div>
    </div>
  );
}
