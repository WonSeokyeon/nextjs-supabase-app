import type { Event } from "@/lib/types/event";

// F008: 이벤트 상태 자동 관리 — start_at/end_at과 현재 시각을 비교해 상태를 계산한다(DB에 별도 컬럼으로 저장하지 않음)
export function statusFromDates(
  startAt: string,
  endAt: string,
): Event["status"] {
  const now = Date.now();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "ongoing";
}
