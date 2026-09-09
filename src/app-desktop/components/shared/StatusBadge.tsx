import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  colorMap: Record<string, string>;
  fallbackClassName?: string;
}

const DEFAULT_FALLBACK = "border-transparent bg-muted text-muted-foreground";

export function StatusBadge({ status, colorMap, fallbackClassName }: StatusBadgeProps) {
  const className = colorMap[status] ?? fallbackClassName ?? DEFAULT_FALLBACK;
  return (
    <Badge variant="outline" className={cn(className)}>
      {status}
    </Badge>
  );
}
