import { Suspense } from "react";

import {
  EventStatusChart,
  EventTrendChart,
} from "@/components/analytics-charts";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { getEventAnalytics } from "@/lib/supabase/queries/admin";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">통계 분석</h1>
      <Suspense fallback={<LoadingSkeleton count={2} />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}

async function AnalyticsContent() {
  const { dailyTrend, statusDistribution } = await getEventAnalytics();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <EventTrendChart data={dailyTrend} />
      <EventStatusChart data={statusDistribution} />
    </div>
  );
}
