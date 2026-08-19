// Task 009~011(이벤트 CRUD, 참여자 관리, 관리자 대시보드 API)에서 구현될 응답 타입 — API 구현 전 미리 설계

import type { Event } from "@/lib/types/event";
import type { EventParticipant } from "@/lib/types/participant";

// API 응답 공통 제네릭 타입 — 성공/실패 두 가지 케이스만 존재하는 유니온
export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code?: string } };

// F007: 참여 목록 조회, F008: 이벤트 상태 자동 관리 — 이벤트 목록 응답
export type EventListResponse = ApiResponse<Event[]>;

// F005: 이벤트 상세 — 이벤트 상세 정보 + 참여자 목록 응답
export type EventDetailResponse = ApiResponse<
  Event & { participants: EventParticipant[] }
>;

// F004: 초대 링크 참여 — 이벤트 참여 응답
export type JoinEventResponse = ApiResponse<EventParticipant>;

// F012: 관리자 대시보드 — 전체 통계 응답
export type AdminDashboardStatsResponse = ApiResponse<{
  totalEvents: number;
  totalUsers: number;
  activeEvents: number;
}>;
