import { Suspense } from "react";
import { connection } from "next/server";

import {
  EventStatusChart,
  EventTrendChart,
} from "@/components/analytics-charts";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { createMockEvents } from "@/lib/mock-data";

const STATUS_LABELS: Record<string, string> = {
  upcoming: "예정",
  ongoing: "진행중",
  ended: "종료",
};

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
  // mock 데이터가 new Date()/랜덤 값을 사용해 cacheComponents 프리렌더링과 충돌하므로 동적 렌더링으로 명시
  await connection();

  // 최근 7일 이벤트 생성 추이 — 실제 집계는 Task011 범위, 지금은 요일별 mock 카운트
  const today = new Date();
  const dailyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      count: [3, 5, 2, 6, 4, 8, 5][i],
    };
  });

  const events = createMockEvents(30);
  const statusDistribution = (["upcoming", "ongoing", "ended"] as const).map(
    (status) => ({
      label: STATUS_LABELS[status],
      count: events.filter((event) => event.status === status).length,
    }),
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <EventTrendChart data={dailyTrend} />
      <EventStatusChart data={statusDistribution} />
    </div>
  );
}
