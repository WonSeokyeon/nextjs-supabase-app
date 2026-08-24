import { createClient } from "@/lib/supabase/server";
import type { EventParticipant } from "@/lib/types/participant";
import type { Tables } from "@/lib/supabase/database.types";

function mapRow(row: Tables<"event_participants">): EventParticipant {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    joinedAt: row.joined_at,
  };
}

// F007: 이벤트 참여자 목록 조회
export async function getEventParticipants(
  eventId: string,
): Promise<EventParticipant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_participants")
    .select("*")
    .eq("event_id", eventId)
    .order("joined_at", { ascending: true });

  if (error || !data) return [];
  return data.map(mapRow);
}

// 초대 페이지에서 "이미 참여했습니다" 상태를 보여주기 위한 중복 참여 확인
export async function hasJoinedEvent(
  eventId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_participants")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  return data !== null;
}
