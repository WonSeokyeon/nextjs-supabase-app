import { Suspense } from "react";
import { connection } from "next/server";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { LogoutButton } from "@/components/logout-button";
import { createMockProfile } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">프로필</h1>
      <Suspense fallback={<LoadingSkeleton count={1} />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}

async function ProfileContent() {
  // getClaims()의 쿠키 접근과 mock 데이터의 랜덤 값이 cacheComponents 프리렌더링과 충돌하므로 동적 렌더링으로 명시
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims.email as string | undefined;

  // profiles 테이블이 아직 없어(Task 007 이전) displayName/avatarUrl은 mock으로 보완
  const profile = createMockProfile({ email: email ?? "unknown@example.com" });
  const displayName = profile.displayName ?? profile.email;

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-8">
        <Avatar size="lg">
          {profile.avatarUrl && (
            <AvatarImage src={profile.avatarUrl} alt={displayName} />
          )}
          <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="font-medium">{displayName}</p>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
        <LogoutButton />
      </CardContent>
    </Card>
  );
}
