import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, type LucideIcon } from "lucide-react";

interface TrendItemProps {
  icon: LucideIcon;
  name: string;
  subtitle: string;
  rating?: number;
  growth: string;
  trend: "up" | "down";
  badgeText?: string;
}

export function TrendItem({
  icon: Icon,
  name,
  subtitle,
  rating,
  growth,
  trend,
  badgeText,
}: TrendItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rating && (
          <div className="flex items-center">
            <span className="mr-1 text-sm font-medium">{rating}</span>
            <span className="text-yellow-500">★</span>
          </div>
        )}
        {badgeText && <Badge variant="outline">{badgeText}</Badge>}
        <Badge
          className={
            trend === "up"
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          }
        >
          <span className="flex items-center gap-1">
            {growth}
            {trend === "up" ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
          </span>
        </Badge>
      </div>
    </div>
  );
}
