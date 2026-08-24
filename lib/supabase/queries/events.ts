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

// F007, F008: 로그인한 사용자가 주최한 이벤트 목록
export async function getMyEvents(): Promise<Event[]> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return [];

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("created_by", userId)
    .order("start_at", { ascending: true });

  if (error || !data) return [];
  return data.map(mapRow);
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
