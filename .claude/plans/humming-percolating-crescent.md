# CLAUDE.md 복원 및 보강

## Context

이 저장소에는 커밋 `2460365`("📝 docs: CLAUDE.md 프로젝트 가이드 작성")에서 작성된 CLAUDE.md가 있었으나, 이후 작업(아마도 `.claude/agents/docs/guides/` 관련 작업 중)에서 로컬 워킹 트리에서 삭제되었고(unstaged deletion, `git status`에 `D CLAUDE.md`로 표시), 아직 커밋되지 않은 상태다.

3개의 Explore 에이전트로 현재 코드베이스(도구 체인, 아키텍처, 문서 상태)를 검증한 결과, 삭제된 CLAUDE.md의 내용은 **현재 상태와 거의 정확히 일치**한다 — 명령어, Husky/lint-staged 훅, Proxy 기반 세션 갱신, 3종 Supabase 클라이언트 구분, 폼 패턴, `next.config.ts` 설정 모두 유효하다.

다만 한 가지 새로운 사실이 발견됐다: `.claude/agents/docs/guides/`라는 새 디렉토리(git 상태 `??`, 아직 추적 안 됨)가 루트 `docs/`와 **동일한 파일명 5개**(`nextjs-16.md`, `project-structure.md`, `component-patterns.md`, `styling-guide.md`, `forms-react-hook-form.md`)를 담고 있는데, 이는 프로젝트에 맞게 수정되지 않은 **원본 제네릭 템플릿 사본**(`src/app` 구조 전제, Tailwind v4 가정, 홑따옴표 스타일 등 이 저장소와 불일치)이다. 반면 루트 `docs/`는 이미 실제 프로젝트 상태(플랫 구조, Tailwind v3 등)에 맞게 수정되어 있다. 이 둘을 혼동하면 향후 Claude Code 인스턴스가 잘못된 문서를 참고해 틀린 코드를 생성할 위험이 있으므로, CLAUDE.md에 명확히 구분해서 명시해야 한다.

사용자는 "기존 내용 복원 + 보강" 방향을 선택했다. 따라서 새로 처음부터 설계하지 않고, 검증된 기존 내용을 그대로 복원하되 위 문서 구분 사항만 추가한다.

## 계획

`D:\my-workspace\nextjs-supabase-app\CLAUDE.md`를 새로 생성한다 (Write 도구, 기존 파일 없음 — 워킹 트리에서 삭제된 상태이므로 새로 쓰는 것과 동일).

내용은 `git show HEAD:CLAUDE.md`로 확인된 기존 버전을 기반으로 하며, 필수 접두사(`# CLAUDE.md\n\nThis file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.`)로 시작한다. 구성:

1. **프로젝트 개요** — Next.js 16 (App Router) + Supabase Auth(SSR 쿠키 기반) 스타터킷, shadcn/ui(new-york) + Tailwind CSS. (기존 내용 그대로)

2. **자주 사용하는 명령어** — `npm run dev/build/start/lint/typecheck/format/format:check`, Husky pre-commit(lint-staged: eslint --fix + prettier --write) / pre-push(typecheck) 설명. `next`/`@supabase/ssr`/`@supabase/supabase-js`가 `"latest"` 고정이라 버전이 유동적이라는 경고 포함. (기존 내용 그대로 — Explore 에이전트가 현재 스크립트/훅 구성과 정확히 일치함을 재확인)

3. **아키텍처**
   - 폴더 구조: `src/` 없이 루트에 `app/`, `components/`, `lib/` (기존 내용 그대로)
   - Proxy(구 Middleware) 기반 인증 세션 갱신: `proxy.ts` → `lib/supabase/proxy.ts`의 `updateSession()` (기존 내용 그대로)
   - 세 가지 Supabase 클라이언트 구분: `client.ts`(브라우저), `server.ts`(Server Component/Action), `proxy.ts`(세션 갱신) — 컨텍스트별 사용법 (기존 내용 그대로)
   - `getClaims()` 사용 규칙 (기존 내용 그대로)
   - 폼 패턴: `"use client"` + `useState` + `supabase.auth.*` 직접 호출, RHF/Zod 미사용 (기존 내용 그대로)
   - `next.config.ts`의 `cacheComponents: true` 설정 (기존 내용 그대로)

4. **docs/ 문서 안내 — 갱신 필요** 기존 문단에 아래 구분을 추가:
   - 루트 `docs/` (5개 파일): 실제 프로젝트 상태(플랫 구조, Tailwind v3 등)에 맞게 이미 수정된 신뢰 가능한 참고 문서
   - `.claude/agents/docs/guides/` (동일 파일명 5개, 신규): **수정되지 않은 원본 제네릭 템플릿 사본** — `src/app` 구조·Tailwind v4·RHF 기설치 등 이 저장소와 맞지 않는 내용을 담고 있으므로 코드 작성 시 참고하지 말 것. 문서 생성/정리 에이전트(starter-cleaner 등)가 참조하는 소스로 추정되며, 실제 프로젝트 문서인 루트 `docs/`와 혼동 금지.

5. **Supabase 마이그레이션 워크플로우** — 로컬 `supabase/` 디렉터리 없음, MCP 도구(`mcp__supabase__apply_migration` 등)로 원격 프로젝트(`bkhykwdpxapfkhjdwxlx`)에 직접 적용. (기존 내용 그대로)

6. **MCP 서버** — `.mcp.json`에 supabase, playwright, context7, sequential-thinking, shadcn, shrimp-task-manager 설정. shadcn 컴포넌트 추가 시 `shadcn` MCP 도구 우선 활용. (기존 내용 그대로)

## 검증

- 파일 작성 후 `git status`로 CLAUDE.md가 정상적으로 워킹 트리에 나타나는지 확인 (커밋은 하지 않음 — 사용자가 명시적으로 요청하지 않는 한).
- 내용 중 언급된 파일 경로(`lib/supabase/client.ts`, `server.ts`, `proxy.ts`, `database.types.ts`, `next.config.ts`, `.mcp.json`)가 실제로 존재하는지 최종 확인.
