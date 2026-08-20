import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ParticipantCardProps } from "@/lib/types/component-props";

const relativeTimeFormatter = new Intl.RelativeTimeFormat("ko-KR", {
  numeric: "always",
});

function formatJoinedAt(joinedAt: string): string {
  const diffMs = new Date(joinedAt).getTime() - Date.now();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays !== 0) {
    return `${relativeTimeFormatter.format(diffDays, "day")} 참여`;
  }

  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  if (diffHours !== 0) {
    return `${relativeTimeFormatter.format(diffHours, "hour")} 참여`;
  }

  const diffMinutes = Math.round(diffMs / (60 * 1000));
  return `${relativeTimeFormatter.format(diffMinutes, "minute")} 참여`;
}

export function ParticipantCard({
  participant,
  profile,
}: ParticipantCardProps) {
  const displayName = profile.displayName ?? profile.email;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar>
        {profile.avatarUrl && (
          <AvatarImage src={profile.avatarUrl} alt={displayName} />
        )}
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{displayName}</span>
        <span className="truncate text-xs text-muted-foreground">
          {formatJoinedAt(participant.joinedAt)}
        </span>
      </div>
    </div>
  );
}
