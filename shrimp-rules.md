# AI Agent 개발 표준 (nextjs-supabase-app)

> 이 문서는 AI Agent가 이 저장소에서 코드를 수정/생성할 때 따라야 하는 **프로젝트 고유 규칙**만 담는다. Next.js/React/TypeScript 일반 지식은 포함하지 않는다.

## 1. 프로젝트 현재 상태 (가장 먼저 확인할 것)

- **[중요] 실제 구현 상태는 스타터킷 그대로다.** 구현된 것: `app/auth/*` 튜토리얼 인증 플로우, `app/protected/*`, `app/instruments/page.jsx` 데모 페이지뿐이다.
- **[중요] DB 스키마도 아직 데모 상태다.** `lib/supabase/database.types.ts`에는 `instruments` 테이블 하나만 존재한다. `docs/PRD.md`나 `.claude/agents/docs/PRD.md`에 나오는 클럽/이벤트/카풀/정산 관련 테이블은 **아직 하나도 만들어지지 않았다.**
- 코드를 작성/수정하기 전에 항상 실제 파일(`app/`, `components/`, `lib/`)을 먼저 확인하고, 아래 문서들의 설명은 "계획"으로만 취급할 것 — 문서와 코드가 다르면 코드가 항상 맞다.

## 2. [중요] 서로 충돌하는 두 개의 기획 문서가 공존한다 — 임의로 하나를 골라 구현 금지

이 저장소에는 **서로 다른 두 제품 방향**의 기획 문서가 동시에 존재한다.

| 위치                                                           | 문서                                 | 제품 컨셉                                                                   |
| -------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------- |
| `docs/PRD.md`, `docs/LEANCANVAS.md`                            | "모임 이벤트 관리 웹 MVP"            | 정기 모임(클럽) + 회차 + 카풀 + 정산                                        |
| `.claude/agents/docs/PRD.md`, `.claude/agents/docs/ROADMAP.md` | "Gather - 일회성 이벤트 관리 플랫폼" | 초대 링크 기반 일회성 이벤트, Google 로그인, 실시간 참여자, 관리자 대시보드 |

- **금지**: 사용자가 "PRD대로 구현해줘", "로드맵 다음 작업 진행해줘"처럼 어느 문서를 말하는지 명시하지 않은 채 기능 구현을 요청하면, 두 문서 중 하나를 임의로 골라 구현을 시작하지 말 것.
- **필수**: 이런 모호한 요청을 받으면 두 기획이 공존한다는 사실을 알리고 어느 방향을 기준으로 할지 먼저 확인할 것.
- `.claude/agents/docs/ROADMAP.md`는 "Gather" 기획에 대한 로드맵이며, `docs/` 루트에는 대응하는 ROADMAP.md가 없다(대신 `docs/LEANCANVAS.md`가 짝을 이룸). 두 세트를 섞어서 참조하지 말 것 (예: `docs/PRD.md`의 데이터 모델을 `.claude/agents/docs/ROADMAP.md`의 작업 항목에 적용하는 식의 혼용 금지).

## 3. 문서 디렉터리 구분 — `.claude/agents/docs/guides/`는 코드 작성 시 참고 금지

- 실제 코드 작성 규칙을 확인할 때는 **루트 `docs/`만** 참고할 것: `docs/project-structure.md`, `docs/component-patterns.md`, `docs/styling-guide.md`, `docs/nextjs-16.md`, `docs/forms-react-hook-form.md`.
- `.claude/agents/docs/guides/` 아래의 동일 파일명 5개는 **미수정 원본 제네릭 템플릿 사본**이다. `src/app` 구조와 Tailwind v4를 전제로 하는 등 이 저장소의 실제 상태와 맞지 않는다. 코드 작성 근거로 **절대 사용하지 말 것.**
- `.claude/agents/docs/PRD.md`, `.claude/agents/docs/ROADMAP.md`는 위 `guides/`와 별개로, 실제로 유효한 "Gather" 기획 문서다 (2절 참고) — guides/의 "무시할 템플릿" 취급과 혼동하지 말 것.
- `docs/forms-react-hook-form.md`가 제안하는 React Hook Form + Zod 패턴은 **아직 설치되지 않았다.** 이 문서를 근거로 `react-hook-form`/`zod` import 코드를 작성하기 전에 반드시 패키지와 필요한 shadcn 컴포넌트를 먼저 설치할 것.

## 4. Supabase 클라이언트 — 문맥별로 정확히 하나만 사용

| 실행 문맥                         | 사용할 파일/함수                                           |
| --------------------------------- | ---------------------------------------------------------- |
| Client Component (`"use client"`) | `lib/supabase/client.ts`의 `createClient()` (동기)         |
| Server Component / Server Action  | `lib/supabase/server.ts`의 `await createClient()` (비동기) |
| Proxy (`proxy.ts`)                | `lib/supabase/proxy.ts`의 `updateSession()`                |

- **금지**: Server Component/Action에서 `lib/supabase/client.ts`를 import하거나, 반대로 Client Component에서 `lib/supabase/server.ts`를 import하는 것.
- **금지**: 이 세 클라이언트 생성 함수의 반환값을 모듈 스코프/전역 변수에 캐싱하는 것. Fluid compute 환경을 고려해 매 요청/함수 호출마다 새로 생성해야 한다 (기존 코드의 주석에 명시됨).
- **필수**: 로그인 여부 확인은 항상 `supabase.auth.getClaims()`를 사용한다. `supabase.auth.getUser()`로 대체하지 말 것 (더 느리고 이 저장소 패턴과 불일치).

## 5. `lib/supabase/proxy.ts` 수정 시 절대 규칙

- `createServerClient(...)` 호출과 `await supabase.auth.getClaims()` 호출 사이에 **어떤 코드도 추가하지 말 것.** 파일 내 주석에 명시된 대로, 사용자가 무작위로 로그아웃되는 디버깅하기 어려운 버그를 유발한다.
- `supabaseResponse` 객체는 그대로 반환해야 한다. 새 `NextResponse`를 만들어야 하는 경우 반드시: (1) `NextResponse.next({ request })`로 생성, (2) `myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())`로 쿠키 복사, (3) 그 이후에만 커스텀 로직 추가. 쿠키를 복사하지 않으면 브라우저와 서버 세션이 어긋난다.
- 인증 필요 경로 판단 로직(`request.nextUrl.pathname !== "/" && !user && !pathname.startsWith("/login") && !pathname.startsWith("/auth")`)을 수정할 때는 `/`, `/login*`, `/auth/*`가 공개 경로라는 기존 화이트리스트 방식을 유지할 것 — 블랙리스트 방식으로 뒤집지 말 것.

## 6. 폼 구현 패턴 — 기존 스타일과 통일

- 새 폼을 추가할 때는 `components/login-form.tsx`, `sign-up-form.tsx`, `forgot-password-form.tsx`, `update-password-form.tsx`와 동일한 패턴을 따를 것: `"use client"` + `useState`로 필드/에러/로딩 상태 관리 + `supabase.auth.*` 직접 호출.
- React Hook Form이나 Zod를 사용하는 폼을 새로 만들지 말 것 — 3절에서 언급했듯 아직 설치되지 않은 패턴이며, 기존 폼들과 스타일이 달라져 일관성이 깨진다. (사용자가 명시적으로 RHF/Zod 도입을 요청한 경우는 예외.)

## 7. `next.config.ts` / `cacheComponents` 관련

- `cacheComponents: true`가 켜져 있다. 요청 시점에만 결정되는 데이터(쿠키, 헤더, 검색 파라미터, DB 조회 등)를 사용하는 컴포넌트를 새로 작성할 때는 `'use cache'` 지시어, `<Suspense>` 경계, 또는 명시적 동적 렌더링 경계 중 하나로 반드시 감쌀 것. 감싸지 않으면 빌드/런타임 오류가 발생한다.

## 8. Supabase 스키마 변경 워크플로우

- 이 저장소에는 로컬 `supabase/` 디렉터리(마이그레이션 파일, CLI 설정)가 **없다.**
- 스키마 변경은 `mcp__supabase__apply_migration` 등 Supabase MCP 도구로 원격 프로젝트에 직접 적용한다.
- 로컬 CLI 기반 마이그레이션 워크플로우(`supabase migration new`, `supabase db push` 등)를 가정하거나 제안하지 말 것.
- `database.types.ts`는 Supabase에서 생성된 파일이다. 스키마를 변경했다면 `mcp__supabase__generate_typescript_types`로 재생성할 것 — 수동으로 타입을 고쳐쓰지 말 것.

## 9. 의존성 버전 관련 주의

- `package.json`에서 `next`, `@supabase/ssr`, `@supabase/supabase-js`는 `"latest"`로 고정되어 있어 `npm install` 시점마다 실제 설치 버전이 달라질 수 있다.
- 버전에 민감한 API 사용 여부를 판단해야 할 때는 `package.json`의 버전 문자열을 신뢰하지 말고, `node_modules/next/package.json`, `node_modules/@supabase/ssr/package.json` 등에서 실제 설치된 버전을 먼저 확인할 것.

## 10. 커밋/검증 워크플로우

- `check-all` 같은 통합 검증 스크립트는 존재하지 않는다. 개별적으로 `npm run lint`, `npm run typecheck`, `npm run format:check`를 실행할 것.
- `pre-commit` 훅(`.husky/pre-commit`)이 staged 파일에 ESLint `--fix` + Prettier `--write`를 자동 실행하고, `pre-push` 훅이 프로젝트 전체 `typecheck`를 자동 실행한다 — 별도 테스트 러너는 설정되어 있지 않으므로 존재하지 않는 `npm test` 등을 실행하려 하지 말 것.
- 커밋 메시지는 한글로 작성하고, 이모지 + Conventional Commits 형식을 따를 것 (기존 로그 참고: `📝 docs:`, `✨ feat:`, `🔥 chore:`). `git:commit` 스킬을 사용할 수 있으면 우선 사용할 것.

## 11. 금지 사항 요약

- `.claude/agents/docs/guides/` 문서를 코드 작성 근거로 사용하는 것.
- 두 PRD(`docs/PRD.md` vs `.claude/agents/docs/PRD.md`) 중 사용자 확인 없이 하나를 임의로 선택해 구현을 시작하는 것.
- Server/Client/Proxy용 Supabase 클라이언트를 문맥에 안 맞게 섞어 쓰거나 전역에 캐싱하는 것.
- `proxy.ts`의 `createServerClient` ~ `getClaims()` 사이에 코드를 추가하거나, `supabaseResponse` 쿠키를 복사하지 않고 새 응답을 반환하는 것.
- `docs/forms-react-hook-form.md`를 근거로, 패키지 설치 없이 `react-hook-form`/`zod` import 코드를 작성하는 것.
- 로컬 `supabase/` CLI 마이그레이션 워크플로우를 가정하는 것.
