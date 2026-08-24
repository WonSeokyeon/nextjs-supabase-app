// UI 프로토타이핑 전용 더미 데이터 생성 유틸리티
// events/event_participants/profiles.role은 Task 009~011에서 모두 실제 DB로 대체되었다.
// createMockProfile만 app/(main)/profile/page.tsx의 displayName/avatarUrl 보완용으로 남아있다.
import type { Profile } from "@/lib/types/profile";

function pick<T>(items: T[], index: number): T {
  return items[index % items.length];
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
