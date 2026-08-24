import { createClient } from "@/lib/supabase/server";
import { statusFromDates } from "@/lib/event-status";
import type { Event } from "@/lib/types/event";
import type { Tables } from "@/lib/supabase/database.types";

function mapRow(row: Tables<"events">): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    coverImageUrl: row.cover_image_url,
    inviteCode: row.invite_code,
    startAt: row.start_at,
    endAt: row.end_at,
    createdBy: row.created_by,
    status: statusFromDates(row.start_at, row.end_at),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface MyEvent extends Event {
  role: "organizer" | "participant";
}

// F007, F008: 로그인한 사용자가 주최했거나(organizer) 참여한(participant) 이벤트 목록
export async function getMyEvents(): Promise<MyEvent[]> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return [];

  const [organizedResult, participantRowsResult] = await Promise.all([
    supabase.from("events").select("*").eq("created_by", userId),
    supabase
      .from("event_participants")
      .select("event_id")
      .eq("user_id", userId),
  ]);

  const organizedEvents: MyEvent[] = (organizedResult.data ?? []).map(
    (row) => ({ ...mapRow(row), role: "organizer" as const }),
  );

  const participatedIds = (participantRowsResult.data ?? []).map(
    (row) => row.event_id,
  );

  const participatedEvents: MyEvent[] = participatedIds.length
    ? (
        (await supabase.from("events").select("*").in("id", participatedIds))
          .data ?? []
      ).map((row) => ({ ...mapRow(row), role: "participant" as const }))
    : [];

  // 조직자가 본인 이벤트에 직접 참여 등록을 해도 중복 노출되지 않도록 organizer를 우선한다
  const merged = new Map<string, MyEvent>();
  for (const event of [...organizedEvents, ...participatedEvents]) {
    if (!merged.has(event.id)) merged.set(event.id, event);
  }

  return [...merged.values()].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
}

// F005: 이벤트 상세 조회
export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data);
}

// F002, F004: 초대 코드로 이벤트 조회 — RLS가 조회를 공개했으므로 비로그인 사용자도 접근 가능
export async function getEventByInviteCode(
  code: string,
): Promise<Event | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("invite_code", code)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data);
}
