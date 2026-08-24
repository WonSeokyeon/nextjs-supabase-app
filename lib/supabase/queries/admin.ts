import { createClient } from "@/lib/supabase/server";
import { statusFromDates } from "@/lib/event-status";
import { mapRow as mapEventRow } from "@/lib/supabase/queries/events";
import type { Event } from "@/lib/types/event";

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalUsers: number;
  newParticipantsThisWeek: number;
}

// F012: 관리자 대시보드 통계
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [eventsResult, usersCountResult, newParticipantsResult] =
    await Promise.all([
      supabase.from("events").select("start_at, end_at"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("event_participants")
        .select("*", { count: "exact", head: true })
        .gte("joined_at", sevenDaysAgo),
    ]);

  const events = eventsResult.data ?? [];
  const activeEvents = events.filter(
    (event) => statusFromDates(event.start_at, event.end_at) === "ongoing",
  ).length;

  return {
    totalEvents: events.length,
    activeEvents,
    totalUsers: usersCountResult.count ?? 0,
    newParticipantsThisWeek: newParticipantsResult.count ?? 0,
  };
}

export interface AdminEventRow extends Event {
  participantCount: number;
}

// F013: 이벤트 관리 테이블 — 전체 이벤트 + 참여자 수
export async function getAllEventsForAdmin(): Promise<AdminEventRow[]> {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (!events || events.length === 0) return [];

  const { data: participantRows } = await supabase
    .from("event_participants")
    .select("event_id");

  const countByEvent = new Map<string, number>();
  for (const row of participantRows ?? []) {
    countByEvent.set(row.event_id, (countByEvent.get(row.event_id) ?? 0) + 1);
  }

  return events.map((row) => ({
    ...mapEventRow(row),
    participantCount: countByEvent.get(row.id) ?? 0,
  }));
}

export interface DailyTrendPoint {
  date: string;
  count: number;
}

export interface StatusDistributionPoint {
  label: string;
  count: number;
}

const STATUS_LABELS: Record<Event["status"], string> = {
  upcoming: "예정",
  ongoing: "진행중",
  ended: "종료",
};

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// F015: 통계 분석 — 최근 7일 생성 추이 + 상태 분포
export async function getEventAnalytics(): Promise<{
  dailyTrend: DailyTrendPoint[];
  statusDistribution: StatusDistributionPoint[];
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("start_at, end_at, created_at");
  const events = data ?? [];

  const today = new Date();
  const dailyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const dateKey = toDateKey(date);
    const count = events.filter(
      (event) => toDateKey(new Date(event.created_at)) === dateKey,
    ).length;
    return { date: `${date.getMonth() + 1}/${date.getDate()}`, count };
  });

  const statusDistribution = (["upcoming", "ongoing", "ended"] as const).map(
    (status) => ({
      label: STATUS_LABELS[status],
      count: events.filter(
        (event) => statusFromDates(event.start_at, event.end_at) === status,
      ).length,
    }),
  );

  return { dailyTrend, statusDistribution };
}
