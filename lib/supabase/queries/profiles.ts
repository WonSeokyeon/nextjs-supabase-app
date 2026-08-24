import { createClient } from "@/lib/supabase/server";

export interface DisplayProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

function toDisplayName(
  fullName: string | null,
  username: string | null,
): string {
  return fullName ?? username ?? "참여자";
}

// 참여자 카드 등에서 쓰는 최소 표시 정보 — profiles 테이블에는 role/email이 없으므로
// (관리자 판별용 role 컬럼은 Task 011에서 별도로 다룬다) 여기서는 이름/아바타만 조회한다
export async function getProfilesByIds(
  ids: string[],
): Promise<Map<string, DisplayProfile>> {
  const map = new Map<string, DisplayProfile>();
  if (ids.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .in("id", ids);

  if (error || !data) return map;

  for (const row of data) {
    map.set(row.id, {
      id: row.id,
      displayName: toDisplayName(row.full_name, row.username),
      avatarUrl: row.avatar_url,
    });
  }

  return map;
}
