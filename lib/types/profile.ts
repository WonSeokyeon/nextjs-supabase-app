// 프론트엔드 임시 타입 — Task 007에서 실제 Supabase DB 스키마 타입(lib/supabase/database.types.ts)으로 교체 예정

// 사용자 프로필 엔티티 타입
// - F010: Google OAuth 로그인
// - F011: 프로필
// - F014: 사용자 관리
export interface Profile {
  id: string;
  email: string; // F010: Google OAuth 로그인
  displayName: string | null; // F011: 프로필
  avatarUrl: string | null; // F011: 프로필
  role: "user" | "admin"; // F014: 사용자 관리
  createdAt: string;
}
