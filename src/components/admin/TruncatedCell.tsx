import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TruncatedCellProps {
  value: string | null | undefined;
  maxWidth?: string;
  className?: string;
}

export function TruncatedCell({ value, maxWidth = "max-w-[150px]", className }: TruncatedCellProps) {
  if (!value) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            className={cn(
              "block truncate cursor-default text-foreground",
              maxWidth,
              className
            )}
          >
            {value}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-[400px] whitespace-pre-wrap text-sm"
        >
          {value}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
