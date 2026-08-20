// UI 프로토타이핑 전용 더미 데이터 생성 유틸리티 — Task 007(DB 연동)에서 대체될 예정
import type { Event } from "@/lib/types/event";
import type { EventParticipant } from "@/lib/types/participant";
import type { Profile } from "@/lib/types/profile";

const SAMPLE_TITLES = [
  "동아리 여름 MT",
  "사내 신년 파티",
  "생일 파티",
  "번개 등산 모임",
  "스터디 그룹 회식",
  "졸업 전시회 뒤풀이",
];

const SAMPLE_LOCATIONS = [
  "서울 강남구 카페거리",
  "경기도 가평 펜션",
  "부산 해운대 비치",
  "제주도 애월읍",
  "서울 홍대 클럽",
];

const SAMPLE_DESCRIPTIONS = [
  "오랜만에 다 같이 모여서 즐거운 시간 보내요!",
  "간단한 다과와 함께 편하게 이야기 나누는 자리입니다.",
  "새로운 멤버들과 인사하는 자리니 편하게 참여해주세요.",
];

function pick<T>(items: T[], index: number): T {
  return items[index % items.length];
}

// 초대 코드에서 혼동되는 문자(0/O, 1/I)는 제외
const INVITE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomInviteCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code +=
      INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)];
  }
  return code;
}

function statusFromDates(startAt: string, endAt: string): Event["status"] {
  const now = Date.now();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "ongoing";
}

// 호출할 때마다 증가시켜 샘플 문구와 시작일을 분산시키는 용도(과거/현재/미래가 골고루 섞이도록)
let mockEventSequence = 0;

export function createMockEvent(overrides: Partial<Event> = {}): Event {
  const index = mockEventSequence++;
  const now = new Date();
  const start = new Date(now.getTime() + (index - 2) * 3 * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

  const startAt = overrides.startAt ?? start.toISOString();
  const endAt = overrides.endAt ?? end.toISOString();

  return {
    id: crypto.randomUUID(),
    title: pick(SAMPLE_TITLES, index),
    description: pick(SAMPLE_DESCRIPTIONS, index),
    location: pick(SAMPLE_LOCATIONS, index),
    coverImageUrl: null,
    inviteCode: randomInviteCode(),
    createdBy: crypto.randomUUID(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    startAt,
    endAt,
    status: statusFromDates(startAt, endAt),
    ...overrides,
  };
}

export function createMockEvents(count: number): Event[] {
  return Array.from({ length: count }, () => createMockEvent());
}

// mock 단계 임시 헬퍼 — eventId를 결정론적으로 해시해 항상 동일한 주최/참여 여부를 반환한다.
// 실제 소유권 판별은 Task 008에서 event.createdBy === session.user.id 비교로 대체될 예정.
export function isMockOrganizer(eventId: string): boolean {
  let hash = 0;
  for (const char of eventId) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1000;
  }
  return hash % 2 === 0;
}

const SAMPLE_DISPLAY_NAMES = [
  "김민준",
  "이서연",
  "박도윤",
  "최지우",
  "정하은",
  "강시우",
];

let mockProfileSequence = 0;

export function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  const index = mockProfileSequence++;
  const displayName = pick(SAMPLE_DISPLAY_NAMES, index);

  return {
    id: crypto.randomUUID(),
    email: `user${index}@example.com`,
    displayName,
    avatarUrl: null,
    role: "user",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockParticipants(
  eventId: string,
  count: number,
): EventParticipant[] {
  const now = Date.now();
  return Array.from({ length: count }, () => ({
    id: crypto.randomUUID(),
    eventId,
    userId: crypto.randomUUID(),
    joinedAt: new Date(
      now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
    ).toISOString(),
  }));
}
