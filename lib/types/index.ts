// lib/types 배럴 파일 — 이 디렉터리의 모든 타입을 한 곳에서 재export
export * from "./event";
export * from "./participant";
export * from "./profile";
export * from "./component-props";
export * from "./api";
export * from "./form";

// Task 003에서 이 시그니처 그대로 실제 구현 예정 (declare 제거하고 함수 body 작성)
import type { Event } from "./event";
import type { EventParticipant } from "./participant";

export declare function createMockEvent(overrides?: Partial<Event>): Event;
export declare function createMockEvents(count: number): Event[];
export declare function createMockParticipants(
  eventId: string,
  count: number,
): EventParticipant[];
