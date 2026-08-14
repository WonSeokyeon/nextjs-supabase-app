# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js 16 (App Router) + Supabase Auth(SSR 쿠키 기반) 스타터킷. `create-next-app --example with-supabase`에서 시작된 프로젝트이며, shadcn/ui(new-york 스타일) + Tailwind CSS로 구성되어 있다.

## 자주 사용하는 명령어

```bash
npm run dev           # 개발 서버 실행 (localhost:3000)
npm run build         # 프로덕션 빌드
npm run start         # 프로덕션 서버 실행
npm run lint          # ESLint 검사 (next/core-web-vitals + next/typescript)
npm run typecheck     # tsc --noEmit
npm run format        # Prettier로 전체 파일 포맷
npm run format:check  # Prettier 포맷 검사만 (수정 없음)
```

Husky + lint-staged가 설정되어 있다: `pre-commit` 훅에서 staged 파일에 ESLint `--fix`와 Prettier `--write`를 자동 실행하고, `pre-push` 훅에서 `npm run typecheck`(프로젝트 전체 타입 검사)를 자동 실행한다. 설정은 `.husky/pre-commit`, `.husky/pre-push`, `package.json`의 `lint-staged` 필드 참고. `check-all` 같은 통합 스크립트는 없다. 별도의 테스트 러너는 설정되어 있지 않다.

`next`, `@supabase/ssr`, `@supabase/supabase-js`가 모두 `package.json`에 `"latest"`로 고정되어 있어, `npm install` 시점마다 실제 설치 버전이 달라질 수 있다 (현재 확인된 버전: Next 16.3.0, React 19.2.8, @supabase/ssr 0.12.4). 버전에 민감한 이슈를 다룰 때는 `node_modules/*/package.json`에서 실제 설치 버전을 먼저 확인할 것.

## 아키텍처

### 폴더 구조

`src/` 디렉터리 없이 루트에 바로 `app/`, `components/`, `lib/`가 위치한다 (`docs/project-structure.md`는 `src/app` 구조를 전제로 작성되어 있으나 이 저장소에는 해당하지 않음 — 아래 "docs/ 문서 관련 주의사항" 참고).

- `app/` — App Router 라우트. `app/auth/*`는 로그인/회원가입/비밀번호 재설정 페이지, `app/protected/*`는 인증이 필요한 페이지 (자체 `layout.tsx`로 네비게이션 바/푸터를 감쌈).
- `components/` — 페이지 전반에서 쓰이는 컴포넌트. `components/ui/`는 shadcn/ui 프리미티브, `components/tutorial/`은 스타터킷 튜토리얼 전용 컴포넌트.
- `lib/supabase/` — Supabase 클라이언트 3종 (`client.ts`: 브라우저용, `server.ts`: Server Component/Action용 쿠키 기반, `proxy.ts`: 요청 단위 세션 갱신용). `database.types.ts`는 Supabase에서 생성한 타입 정의.

### Proxy(구 Middleware) 기반 인증 세션 갱신

Next.js 16부터 `middleware.ts`/`middleware()`가 `proxy.ts`/`proxy()`로 대체되었다. 이 저장소의 `proxy.ts`는 `lib/supabase/proxy.ts`의 `updateSession()`을 호출하며, 이 함수가 다음을 담당한다:

- 모든 요청에서 Supabase 세션 쿠키를 새로고침
- `hasEnvVars`가 false면 (Supabase 환경변수 미설정) 검사를 건너뜀
- 미인증 사용자가 `/`, `/login*`, `/auth/*` 외의 경로에 접근하면 `/auth/login`으로 리다이렉트

`createServerClient`/`getClaims()` 호출 사이에 다른 코드를 넣지 말 것 — 파일 내 주석에 명시된 대로, 세션 관리가 미묘하게 깨질 수 있다. `supabaseResponse` 객체를 그대로 반환해야 하며, 새 응답을 만들 경우 쿠키를 반드시 복사해야 한다.

### 세 가지 Supabase 클라이언트를 문맥에 맞게 사용

- **Client Component**에서: `lib/supabase/client.ts`의 `createClient()` (동기, `createBrowserClient`)
- **Server Component/Server Action**에서: `lib/supabase/server.ts`의 `await createClient()` (비동기, `cookies()` 기반) — Fluid compute 환경을 고려해 전역 변수에 담지 말고 함수 내부에서 매번 새로 생성
- **Proxy**에서: `lib/supabase/proxy.ts`의 `updateSession()`

인증 상태 확인은 `supabase.auth.getUser()`가 아니라 `supabase.auth.getClaims()`를 사용한다 (`components/auth-button.tsx`, `app/protected/page.tsx` 참고) — 더 빠르고 이 저장소 전반에서 일관되게 쓰이는 패턴.

### 폼 패턴

현재 구현된 폼(`components/login-form.tsx`, `sign-up-form.tsx`, `forgot-password-form.tsx`, `update-password-form.tsx`)은 모두 `"use client"` + `useState` + `supabase.auth.*` 직접 호출 방식이며, React Hook Form이나 Zod는 사용하지 않는다. `docs/forms-react-hook-form.md`는 더 발전된(하지만 아직 코드베이스에 적용되지 않은) 패턴을 제안하는 참고 문서다.

### `next.config.ts` 설정

`cacheComponents: true`가 활성화되어 있다 (Next 15의 실험적 `experimental.dynamicIO`가 정식으로 승격된 기능). 정적으로 결정되지 않는 데이터를 사용하는 컴포넌트는 `'use cache'`, `<Suspense>`, 또는 명시적인 동적 렌더링 경계로 감싸야 한다.

## docs/ 문서 안내

`docs/` 아래에는 Next.js 16 / React 19 패턴에 대한 보편적 가이드 문서(`project-structure.md`, `component-patterns.md`, `styling-guide.md`, `forms-react-hook-form.md`, `nextjs-16.md`)가 있다. 원래 다른 보일러플레이트(`src/` 레이아웃 전제)에서 가져온 문서라 이 저장소와 어긋나는 부분이 많았으나, 구조·버전·존재하지 않는 스크립트 언급 등은 실제 상태에 맞게 수정해 두었다.

**주의: `.claude/agents/docs/guides/`에도 동일한 파일명 5개가 존재하지만, 이는 위 `docs/`와 다른 파일이다.** 이 디렉터리는 프로젝트에 맞게 수정되지 않은 **원본 제네릭 템플릿 사본**으로, `src/app` 구조를 전제하고 Tailwind v4를 가정하는 등 이 저장소의 실제 상태와 맞지 않는 내용을 담고 있다 (문서 생성/정리 에이전트가 참조하는 소스로 추정). 코드를 작성할 때는 반드시 루트 `docs/`만 참고하고, `.claude/agents/docs/guides/`는 참고하지 말 것.

`forms-react-hook-form.md`는 여전히 **아직 설치/적용되지 않은** React Hook Form + Zod 패턴을 제안하는 참고 문서이므로(문서 상단에 명시), 실제로 적용하려면 관련 패키지와 shadcn 컴포넌트를 먼저 설치해야 한다.

`docs/`는 참고 자료일 뿐이며, 실제 동작이 궁금할 때는 항상 코드를 1차 소스로 신뢰할 것.

## Supabase 마이그레이션 워크플로우

로컬 `supabase/` 디렉터리(마이그레이션 파일, CLI 설정)가 없다. 스키마 변경은 Supabase MCP 도구(`mcp__supabase__apply_migration` 등)를 통해 원격 프로젝트에 직접 적용한다. 로컬 CLI 기반 마이그레이션 워크플로우를 가정하지 말 것.

## MCP 서버

`.mcp.json`에 supabase, playwright, context7, sequential-thinking, shadcn, shrimp-task-manager MCP 서버가 설정되어 있다. shadcn/ui 컴포넌트 추가 시 `npx shadcn@latest add [component]` 대신 `shadcn` MCP 도구를 우선 활용할 수 있다.
