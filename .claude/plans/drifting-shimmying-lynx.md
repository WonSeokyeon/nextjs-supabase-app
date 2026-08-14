# Git 커밋 계획

## Context

현재 작업 트리에는 이번 세션에서 진행한 두 갈래의 변경사항이 섞여 있다:

1. Claude Code 개발 도구 설정 (`.mcp.json` 수정, `.claude/agents`·`.claude/commands`·`.claude/hooks` 신규)
2. 프로젝트 문서화 (`CLAUDE.md` 신규 작성, `docs/` 아래 5개 가이드 문서를 실제 코드베이스에 맞게 수정)

`git status` 확인 결과 스테이지된 파일은 없으므로, 전체 작업 트리를 논리적 단위로 나눠 커밋한다. 사용자 확인을 거쳐 다음 두 가지를 결정했다:

- `shrimp_data/WebGUI.md`는 shrimp-task-manager MCP가 실행 시 생성하는 런타임 상태 파일(localhost GUI 주소)이라 버전 관리 대상이 아님 → `.gitignore`에 추가하고 커밋에서 제외
- `.mcp.json`의 `shrimp-task-manager` 항목에 있는 이 PC 전용 절대경로(`D:\my-workspace\mcp-shrimp-task-manager\dist\index.js`)는 개인/단독 사용 프로젝트이므로 수정 없이 그대로 커밋

## 커밋 순서 (5개, 원자적 단위)

### 1. 🔧 chore: MCP 서버 설정 추가

- 대상: `.mcp.json`
- 내용: playwright, context7, sequential-thinking, shadcn, shrimp-task-manager MCP 서버 항목 추가 (기존 supabase 항목은 유지)

### 2. 🔧 chore: Claude Code 로컬 에이전트·커맨드·훅 설정 추가

- 대상: `.claude/agents/`, `.claude/commands/`, `.claude/hooks/` (신규, untracked)
- 내용: 서브에이전트 정의(code-reviewer, development-planner, nextjs-app-developer 등), git/docs 커스텀 슬래시 커맨드, 알림용 훅 스크립트

### 3. 🙈 chore: shrimp-task-manager 런타임 데이터 제외

- 대상: `.gitignore` 수정 (`shrimp_data/` 추가)
- 내용: `shrimp_data/`는 MCP 실행 중 생성되는 로컬 상태 파일이므로 버전 관리에서 제외. 이 커밋에는 `.gitignore` 수정만 포함하고 `shrimp_data/`는 스테이징하지 않는다.

### 4. 📝 docs: CLAUDE.md 프로젝트 가이드 작성

- 대상: `CLAUDE.md` (신규)
- 내용: 이 저장소 전용 개발 가이드 최초 작성 (명령어, 아키텍처, Supabase 클라이언트 3종, Proxy 기반 세션 갱신, docs/ 문서 신뢰도 안내 등)

### 5. 📝 docs: docs/ 가이드 문서를 실제 프로젝트 상태에 맞게 수정

- 대상: `docs/project-structure.md`, `docs/styling-guide.md`, `docs/forms-react-hook-form.md`, `docs/nextjs-16.md`, `docs/component-patterns.md` (전부 신규 파일이지만, 원본이 다른 보일러플레이트 문서를 기반으로 이 저장소에 맞게 대폭 수정되었으므로 "수정"으로 커밋 메시지 작성)
- 내용: `src/` 레이아웃 전제 제거, Tailwind v4→v3.4 정정, 존재하지 않는 npm 스크립트 언급 제거, 미설치 패키지(react-hook-form/zod/prettier) 명시, proxy.ts 관련 오래된 서술 수정, 실제 색상 변수 값으로 교체

## 실행 방법

각 커밋마다:
1. 해당 파일만 `git add`로 스테이징
2. 한글 커밋 메시지로 커밋 (예: `git commit -m "🔧 chore: MCP 서버 설정 추가"`)
3. Claude 서명 없음

## 검증

- 각 커밋 후 `git status`로 의도한 파일만 반영되었는지 확인
- 마지막에 `git log --oneline -6`으로 5개 커밋이 순서대로 쌓였는지 확인
- `git status`가 clean한지 최종 확인 (단, `shrimp_data/`는 `.gitignore`에 의해 무시되어 표시되지 않아야 함)
