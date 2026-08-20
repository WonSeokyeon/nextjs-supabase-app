import { Card, CardContent } from "@/components/ui/card";
import type { StatCardProps } from "@/lib/types/component-props";

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-6">
        {icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
