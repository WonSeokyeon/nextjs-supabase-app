import Link from "next/link";
import { Suspense } from "react";
import { CalendarPlus, LayoutDashboard, Share2, Users } from "lucide-react";

import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasEnvVars } from "@/lib/utils";

const FEATURES = [
  {
    icon: CalendarPlus,
    title: "간편한 이벤트 생성",
    description: "제목, 날짜, 장소만 입력하면 즉시 이벤트가 만들어져요.",
  },
  {
    icon: Share2,
    title: "원클릭 초대 시스템",
    description: "자동 생성된 초대 링크를 카카오톡으로 간편하게 공유하세요.",
  },
  {
    icon: Users,
    title: "실시간 참여자 관리",
    description: "누가 참여했는지 참여자 목록이 실시간으로 업데이트돼요.",
  },
  {
    icon: LayoutDashboard,
    title: "관리자 대시보드",
    description: "플랫폼 전체 현황을 한눈에 파악할 수 있어요.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-10 flex h-16 w-full items-center justify-center border-b bg-background">
        <div className="flex w-full max-w-5xl items-center justify-between px-5">
          <Link href="/" className="text-lg font-bold">
            Gather
          </Link>
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <Suspense>
              <AuthButton />
            </Suspense>
          )}
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center gap-20 px-5 py-16">
        <section className="flex max-w-xl flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-bold !leading-tight lg:text-4xl">
            일회성 이벤트를 간편하게 관리하는
            <br />
            올인원 플랫폼
          </h1>
          <p className="text-muted-foreground">
            초대 링크 하나로 모든 것을 해결하세요. 5~30명 규모의 소규모 모임을
            위한 가장 빠른 이벤트 관리 방법입니다.
          </p>
          <Button asChild size="lg">
            <Link href="/auth/login">무료로 시작하기</Link>
          </Button>
        </section>

        <section className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <Icon className="size-8 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </section>
      </main>

      <footer className="flex w-full items-center justify-center border-t py-8">
        <ThemeSwitcher />
      </footer>
    </div>
  );
}
