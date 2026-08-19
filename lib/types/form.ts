// Task 004(이벤트 생성/수정 폼)와 인증 플로우에서 사용할 상태 타입 — 이 프로젝트엔 전역 상태관리 라이브러리가 없어 폼 상태 + 인증 컨텍스트로 범위 한정

import type { Profile } from "@/lib/types/profile";

// 이벤트 생성/수정 폼의 입력 값 타입
// - F001: 이벤트 생성
// - F009: 커버 이미지 업로드
export interface EventFormValues {
  title: string;
  description: string;
  location: string;
  startAt: string; // ISO 문자열 형태의 시작 일시
  endAt: string; // ISO 문자열 형태의 종료 일시
  coverImage: File | null; // F009: 커버 이미지 (업로드 전 File 객체, 미선택 시 null)
}

// 이벤트 폼 필드별 에러 메시지 타입
// components/login-form.tsx 등 기존 폼의 error 상태(useState<string | null>)와 동일하게
// 필드 단위로 에러 문자열을 관리하기 위한 형태 — 각 필드는 선택적(optional)이며 값이 있으면 에러 메시지
export type EventFormErrors = Partial<Record<keyof EventFormValues, string>>;

// 인증된 사용자 정보 타입 (Supabase Auth + 프로필 결합)
// - F010: Google OAuth 로그인
// - F011: 프로필
export interface AuthenticatedUser {
  id: string;
  email: string;
  profile: Profile | null; // 프로필 미생성/조회 실패 시 null
}
