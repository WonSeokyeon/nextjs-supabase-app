// Task 003~006에서 구현될 컴포넌트의 Props 타입 — 컴포넌트 구현 전 미리 설계

import type { ReactNode } from "react";
import type { Event } from "@/lib/types/event";
import type { EventParticipant } from "@/lib/types/participant";
import type { DisplayProfile } from "@/lib/supabase/queries/profiles";

// 이벤트 카드 컴포넌트 Props
export interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

// 참여자 카드 컴포넌트 Props — profiles 테이블 기반 최소 표시 정보(이름/아바타)만 사용
export interface ParticipantCardProps {
  participant: EventParticipant;
  profile: DisplayProfile;
}

// 통계 카드 컴포넌트 Props
export interface StatCardProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
}

// 빈 상태(Empty State) 컴포넌트 Props
export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

// 로딩 스켈레톤 컴포넌트 Props
export interface LoadingSkeletonProps {
  count?: number;
}
