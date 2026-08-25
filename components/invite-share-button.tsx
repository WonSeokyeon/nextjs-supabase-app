"use client";

import { MessageCircleIcon, Share2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { KakaoShareNotConfiguredError, shareInviteLink } from "@/lib/kakao";

interface InviteShareButtonProps {
  inviteCode: string;
  eventTitle: string;
  eventDescription?: string;
  coverImageUrl?: string | null;
}

export function InviteShareButton({
  inviteCode,
  eventTitle,
  eventDescription,
  coverImageUrl,
}: InviteShareButtonProps) {
  const inviteUrl = () => `${window.location.origin}/join/${inviteCode}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl());
    toast.success("초대 링크가 복사되었습니다");
  }

  async function handleKakaoShare() {
    try {
      await shareInviteLink({
        title: eventTitle,
        description: eventDescription,
        imageUrl: coverImageUrl ?? undefined,
        url: inviteUrl(),
      });
    } catch (error) {
      if (error instanceof KakaoShareNotConfiguredError) {
        toast.error("카카오톡 공유가 아직 설정되지 않았습니다");
        return;
      }
      toast.error("카카오톡 공유에 실패했습니다");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={handleCopy}>
        <Share2Icon />
        링크 복사
      </Button>
      <Button variant="outline" onClick={handleKakaoShare}>
        <MessageCircleIcon />
        카카오톡 공유
      </Button>
    </div>
  );
}
