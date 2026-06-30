import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  href?: string;
  trend?: {
    label: string;
    positive?: boolean;
  };
  className?: string;
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  trend,
  className,
}: StatCardProps) {
  const content = (
    <Card className={cn("transition-colors", href && "hover:bg-muted/40", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription>{title}</CardDescription>
        <Icon className="text-muted-foreground size-4" />
      </CardHeader>
      <CardContent>
        <CardTitle className="text-2xl font-bold tabular-nums">{value}</CardTitle>
        {description ? (
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        ) : null}
        {trend ? (
          <p
            className={cn(
              "mt-2 text-xs font-medium",
              trend.positive ? "text-emerald-600" : "text-muted-foreground",
            )}
          >
            {trend.label}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
