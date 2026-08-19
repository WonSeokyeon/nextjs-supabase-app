// 프론트엔드 임시 타입 — Task 007에서 실제 Supabase DB 스키마 타입(lib/supabase/database.types.ts)으로 교체 예정

// 이벤트 엔티티 타입
// - F001: 이벤트 생성
// - F002: 초대 코드
// - F003: 초대 공유
// - F005: 이벤트 상세
// - F006: 이벤트 수정
// - F008: 이벤트 상태 자동 관리
// - F009: 커버 이미지
export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  coverImageUrl: string | null; // F009: 커버 이미지
  inviteCode: string; // F002: 초대 코드
  startAt: string;
  endAt: string;
  createdBy: string;
  status: "upcoming" | "ongoing" | "ended"; // F008: 이벤트 상태 자동 관리
  createdAt: string;
  updatedAt: string;
}
