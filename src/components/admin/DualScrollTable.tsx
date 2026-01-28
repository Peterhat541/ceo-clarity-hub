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

    updateTopScrollWidth();

    const resizeObserver = new ResizeObserver(updateTopScrollWidth);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className={className}>
      {/* Top scroll bar */}
      <div
        ref={topScrollRef}
        onScroll={() => syncScroll("top")}
        className="overflow-x-auto overflow-y-hidden h-3 border-b border-border bg-secondary/30"
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="scroll-spacer h-1" />
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
