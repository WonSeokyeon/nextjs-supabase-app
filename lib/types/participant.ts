// 프론트엔드 임시 타입 — Task 007에서 실제 Supabase DB 스키마 타입(lib/supabase/database.types.ts)으로 교체 예정

// 이벤트 참여자 엔티티 타입
// - F004: 초대 링크 참여
// - F007: 참여 목록 조회
export interface EventParticipant {
  id: string;
  eventId: string; // F004: 초대 링크 참여
  userId: string;
  joinedAt: string; // F007: 참여 목록 조회
}
