"use client";

import { Share2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface InviteShareButtonProps {
  inviteCode: string;
}

export function InviteShareButton({ inviteCode }: InviteShareButtonProps) {
  async function handleShare() {
    const url = `${window.location.origin}/join/${inviteCode}`;
    await navigator.clipboard.writeText(url);
    toast.success("초대 링크가 복사되었습니다");
  }

  return (
    <Button variant="outline" onClick={handleShare}>
      <Share2Icon />
      초대 링크 공유
    </Button>
  );
}
