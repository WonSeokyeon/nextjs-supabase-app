import { Suspense } from "react";
import { connection } from "next/server";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { createMockProfile } from "@/lib/mock-data";

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">사용자 관리</h1>
      {/* 실제 검색/필터는 Task011에서 API와 함께 연동 예정 */}
      <Input placeholder="사용자 검색" className="mb-4 max-w-sm" disabled />
      <Suspense fallback={<LoadingSkeleton count={8} />}>
        <AdminUsersTable />
      </Suspense>
    </div>
  );
}

async function AdminUsersTable() {
  // mock 데이터가 new Date()/랜덤 값을 사용해 cacheComponents 프리렌더링과 충돌하므로 동적 렌더링으로 명시
  await connection();
  // 8명 중 1명을 admin으로 섞어 역할 배지 두 종류가 모두 보이도록 함
  const users = Array.from({ length: 8 }, (_, i) =>
    createMockProfile(i === 0 ? { role: "admin" } : {}),
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>사용자</TableHead>
          <TableHead>이메일</TableHead>
          <TableHead>역할</TableHead>
          <TableHead>가입일</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const displayName = user.displayName ?? user.email;
          return (
            <TableRow key={user.id}>
              <TableCell className="flex items-center gap-2 font-medium">
                <Avatar size="sm">
                  {user.avatarUrl && (
                    <AvatarImage src={user.avatarUrl} alt={displayName} />
                  )}
                  <AvatarFallback>
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {displayName}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {user.email}
              </TableCell>
              <TableCell>
                <Badge variant={user.role === "admin" ? "default" : "outline"}>
                  {user.role === "admin" ? "관리자" : "일반"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString("ko-KR")}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
