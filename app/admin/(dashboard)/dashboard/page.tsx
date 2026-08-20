import { Suspense } from "react";
import { connection } from "next/server";
import {
  ActivityIcon,
  CalendarIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";

import { LoadingSkeleton } from "@/components/loading-skeleton";
import { StatCard } from "@/components/stat-card";
import { createMockEvents } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">대시보드</h1>
      <Suspense fallback={<LoadingSkeleton count={4} />}>
        <DashboardStats />
      </Suspense>
    </div>
  );
}

async function DashboardStats() {
  // mock 데이터가 new Date()/랜덤 값을 사용해 cacheComponents 프리렌더링과 충돌하므로 동적 렌더링으로 명시
  await connection();
  const events = createMockEvents(24);
  const totalEvents = events.length;
  const activeEvents = events.filter(
    (event) => event.status === "ongoing",
  ).length;
  // 사용자/신규 참여 집계는 실제 프로필/참여 테이블이 없어(Task 007 이전) 고정 mock 값 사용, 실제 집계는 Task011 범위
  const totalUsers = 132;
  const newParticipantsThisWeek = 18;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="총 이벤트"
        value={totalEvents}
        icon={<CalendarIcon className="size-5" />}
      />
      <StatCard
        label="진행중 이벤트"
        value={activeEvents}
        icon={<ActivityIcon className="size-5" />}
      />
      <StatCard
        label="총 사용자"
        value={totalUsers}
        icon={<UsersIcon className="size-5" />}
      />
      <StatCard
        label="이번주 신규 참여"
        value={newParticipantsThisWeek}
        icon={<UserPlusIcon className="size-5" />}
      />
    </div>
  );
}
