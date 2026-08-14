# 구글 소셜 로그인(Google OAuth) 추가

## Context

현재 이 프로젝트의 인증은 `components/login-form.tsx`, `sign-up-form.tsx`에서 이메일/비밀번호 방식(`supabase.auth.signInWithPassword`, `supabase.auth.signUp`)만 지원한다. 사용자가 구글 계정으로 로그인/가입할 수 있는 소셜 로그인(OAuth) 옵션을 추가하려 한다.

저장소 전체를 검색한 결과 `signInWithOAuth`, Google provider 등 OAuth 관련 코드는 전혀 없으며, 이메일 확인 콜백(`app/auth/confirm/route.ts`)만 존재한다. OAuth는 이메일 OTP와 다른 콜백 방식(PKCE의 `exchangeCodeForSession`)을 쓰므로, 이 확인 라우트를 그대로 재사용할 수 없고 별도의 콜백 라우트가 필요하다.

또한 Google OAuth는 코드 작업만으로 동작하지 않는다 — Google Cloud Console에서 OAuth 클라이언트 발급, Supabase 대시보드(Authentication > Providers > Google)에서 Provider 활성화라는 외부 설정이 반드시 선행되어야 한다. 사용자는 이 설정을 아직 하지 않았다고 확인했으므로, 계획에 설정 가이드를 포함한다.

## 접근 방식

### 1. (사용자 액션) Google Cloud Console + Supabase 대시보드 설정 안내

코드 작업 전/후로 사용자가 직접 진행해야 하는 절차를 안내한다 (Claude가 대신 할 수 없는 외부 콘솔 작업):

1. **Supabase 프로젝트의 콜백 URL 확인**: `mcp__supabase__get_project_url`로 프로젝트 URL을 조회해 `https://<project-ref>.supabase.co/auth/v1/callback` 형태의 리다이렉트 URI를 안내
2. **Google Cloud Console**(console.cloud.google.com) > "APIs & Services" > "Credentials"에서 OAuth 2.0 클라이언트 ID 생성
   - Authorized redirect URIs에 위 콜백 URL 등록
3. 발급받은 **Client ID / Client Secret**을 **Supabase 대시보드** > Authentication > Providers > Google에 입력 후 활성화
4. 로컬 개발 시 리다이렉트 대상(`window.location.origin`, 예: `http://localhost:3000`)도 문제없이 동작함 — Supabase가 최종적으로 앱의 `redirectTo` URL로 다시 리다이렉트하기 때문에 앱단 `.env` 추가 설정은 불필요

이 단계는 사용자가 직접 진행해야 하므로, 구현 완료 후 안내 메시지로 정리해서 전달한다.

### 2. 신규 OAuth 콜백 라우트: `app/auth/callback/route.ts`

`app/auth/confirm/route.ts`(GET 핸들러, `lib/supabase/server.ts`의 `createClient()` 사용)와 동일한 구조를 따르되, OTP 검증 대신 PKCE 코드 교환을 사용한다.

```ts
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/protected";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next);
    }
    redirect(`/auth/error?error=${error.message}`);
  }

  redirect(`/auth/error?error=No code provided`);
}
```

- `app/auth/error/page.tsx`는 이미 `searchParams.error`를 표시하도록 되어 있어 그대로 재사용 (수정 불필요)
- `lib/supabase/proxy.ts`의 라우트 보호 로직은 `/auth`로 시작하는 모든 경로를 미인증 상태에서도 허용하므로, 이 신규 라우트는 별도 수정 없이 자동으로 접근 가능

### 3. `components/login-form.tsx`, `components/sign-up-form.tsx`에 구글 로그인 버튼 추가

두 폼 모두 기존 폼 컨벤션(`"use client"` + 자체 `useState`/핸들러, 폼 하단에 구분선 + 버튼)을 그대로 따라 각자 `handleGoogleLogin` 핸들러를 추가한다 (두 폼은 이미 handleLogin/handleSignUp을 각각 독립적으로 구현하는 구조이므로, 공용 훅으로 추상화하지 않고 동일 패턴을 반복하는 것이 기존 코드 스타일과 일치).

```ts
const handleGoogleLogin = async () => {
  const supabase = createClient();
  setError(null);
  setIsLoading(true);
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/protected`,
      },
    });
    if (error) throw error;
  } catch (error: unknown) {
    setError(error instanceof Error ? error.message : "An error occurred");
    setIsLoading(false);
  }
};
```

`signInWithOAuth`는 성공 시 브라우저를 구글 로그인 페이지로 리다이렉트시키므로 `router.push` 호출이 불필요하다(에러 발생 시에만 `isLoading`을 되돌림).

CardContent의 `<form>` 아래(회원가입/로그인 링크 위 또는 아래)에 구분선과 버튼을 추가:

```tsx
<div className="relative my-2">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
  </div>
</div>
<Button
  type="button"
  variant="outline"
  className="w-full"
  onClick={handleGoogleLogin}
  disabled={isLoading}
>
  {/* 구글 브랜드 색상 4색 G 로고 인라인 SVG (lucide-react에는 브랜드 아이콘이 없어 별도 SVG 사용) */}
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">...</svg>
  Continue with Google
</Button>
```

`Button`의 `variant="outline"`은 `components/ui/button.tsx`에 이미 정의된 variant를 재사용한다.

### 4. 변경 불필요 확인 항목

- `lib/supabase/proxy.ts`, 루트 `proxy.ts`: `/auth` prefix가 이미 허용 목록에 있어 수정 없음
- `components/auth-button.tsx`: `getClaims()`로 세션 유무만 확인하므로 provider와 무관하게 그대로 동작
- `types/database.types.ts`: 스키마 변경 없음, 재생성 불필요
- `.env.local`: Google Client ID/Secret은 Supabase 대시보드에만 등록되므로 앱단 환경변수 추가 없음

## 검증 방법

1. `npm run lint`, `npm run typecheck`로 정적 검사
2. 사용자가 Google Cloud Console + Supabase 대시보드 설정을 완료한 뒤, `npm run dev`로 로컬 서버 구동
3. `mcp__playwright__browser_navigate`로 `/auth/login` 접속 → "Continue with Google" 버튼 클릭 → 구글 로그인 흐름 → `/auth/callback` → `/protected`로 최종 리다이렉트되는지 확인 (단, 실제 구글 계정 로그인은 브라우저 자동화로 완결하기 어려울 수 있어 최소한 버튼 클릭 시 구글 OAuth 페이지로 정상 리다이렉트되는지까지 확인)
4. 설정이 아직 안 된 상태라면 버튼 클릭 시 Supabase 쪽 에러(`Unsupported provider` 등)가 `/auth/error` 페이지에 정상 표시되는지로 에러 처리 경로를 검증
