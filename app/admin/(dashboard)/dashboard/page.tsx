import { Suspense } from "react";
import {
  ActivityIcon,
  CalendarIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";

import { LoadingSkeleton } from "@/components/loading-skeleton";
import { StatCard } from "@/components/stat-card";
import { getDashboardStats } from "@/lib/supabase/queries/admin";

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
  const { totalEvents, activeEvents, totalUsers, newParticipantsThisWeek } =
    await getDashboardStats();

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
