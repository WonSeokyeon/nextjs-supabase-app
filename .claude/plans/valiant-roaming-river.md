# 개발 도구 체인 설정 (ESLint / Prettier / Type Check / Husky+lint-staged / 기타)

## Context

이 프로젝트(Next.js 16 + Supabase 스타터킷)는 현재 ESLint만 설정되어 있고, Prettier·타입체크 스크립트·Git 훅·에디터 설정이 전혀 없다. `CLAUDE.md`에는 이미 "`typecheck`, `format`, `check-all` 같은 스크립트는 `package.json`에 정의되어 있지 않다"고 스스로 문서화되어 있을 만큼, 이 공백이 프로젝트 관리 관점에서도 인지되고 있는 상태다.

Claude Code로 웹 개발을 진행하다 보면 (1) 저장/커밋 시점에 스타일이 자동으로 정리되지 않으면 diff가 지저분해지고, (2) 타입 에러가 커밋 이후에야 발견되며, (3) ESLint 규칙이 실제 설치된 Next.js 버전과 어긋난 채(`eslint-config-next` 15.3.1 vs 실제 `next` 16.3.0) 방치되는 문제가 생긴다. 이번 작업은 이 세 가지를 포함해 "커밋 전에 안전망이 자동으로 작동하는" 표준 개발 환경을 구성하는 것이 목표다.

범위는 사용자가 요청한 4가지(ESLint, Prettier, Type Check, Husky+lint-staged)와, 이번 조사에서 자연스럽게 확장된 안전장치(pre-push 타입체크)와 편의 도구(EditorConfig, VS Code 설정)로 한정한다. commitlint와 GitHub Actions CI는 이미 커밋 컨벤션이 `git:commit` 스킬로 관리되고 있고 사용자가 명시적으로 요청하지 않았으므로, 본 구현에는 포함하지 않고 "선택적 권장사항"으로만 남긴다.

## 현재 상태 요약

- `package.json`: scripts는 `dev/build/start/lint`뿐. `packageManager` 필드 없음(→ npm, `package-lock.json` 존재로 확인).
- `eslint-config-next`가 `"15.3.1"`로 하드 고정 — 실제 설치된 `next`는 `16.3.0`(버전 불일치).
- `eslint.config.mjs`: Flat Config, `next/core-web-vitals` + `next/typescript`만 extends.
- Prettier, Husky, lint-staged: 설정 파일도 devDependency도 전혀 없음.
- `.vscode/`, `.editorconfig`: 없음.
- `app/globals.css` 존재 확인 완료 (Prettier의 `tailwindStylesheet` 옵션에 사용).
- `.git` 정상 저장소, Git for Windows 설치되어 있음이 보장됨(→ Husky v9 훅이 `sh`로 문제없이 실행됨. 단 훅 파일은 반드시 LF로 저장).

## 구현 단계

### 1. ESLint — 버전 정합성 맞추고 Prettier와 공존시키기

```
npm install -D eslint-config-next@^16.3.1 eslint-config-prettier@^10.1.8
```

`package.json`의 `eslint-config-next` 고정 버전(`"15.3.1"`)을 `"^16.3.1"`로 교체(설치 명령이 자동 반영).

`eslint.config.mjs` 수정 — 배열 마지막에 `eslint-config-prettier`를 추가해 포매팅 관련 규칙과의 충돌을 원천 차단:
```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  eslintConfigPrettier,
];

export default eslintConfig;
```

### 2. Prettier + Tailwind 클래스 자동 정렬

```
npm install -D prettier@^3.9.6 prettier-plugin-tailwindcss@^0.8.1
```

shadcn/ui + `cn()`/`cva()` 패턴을 쓰는 프로젝트이므로 `tailwindFunctions`에 두 함수를 포함시켜 클래스 문자열이 실제로 정렬되도록 한다.

`.prettierrc.json` 신규 생성:
```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2,
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["cn", "cva", "cx"],
  "tailwindStylesheet": "./app/globals.css"
}
```

`.prettierignore` 신규 생성:
```
node_modules
.next
out
build
coverage
.vercel
package-lock.json
next-env.d.ts
*.tsbuildinfo
public
```

`package.json` scripts에 추가:
```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

### 3. TypeScript type check 스크립트

`package.json` scripts에 추가 (별도 패키지 설치 불필요, `typescript`는 이미 devDependency):
```json
"typecheck": "tsc --noEmit"
```

### 4. Husky + lint-staged (pre-commit 빠른 검사 + pre-push 전체 타입체크)

```
npm install -D husky@^9.1.7 lint-staged@^17.3.0
npx husky init
```

`npx husky init`이 `package.json`에 `"prepare": "husky"`를 추가하고 `.husky/pre-commit`을 생성한다 — 이후 내용을 아래로 교체.

`.husky/pre-commit` (LF로 저장):
```sh
npx lint-staged
```

`.husky/pre-push` 신규 생성 (LF로 저장):
```sh
npm run typecheck
```

`tsc --noEmit`은 프로젝트 전체 타입 그래프를 봐야 해서 staged 파일 단위 실행이 불가능하므로 lint-staged에는 넣지 않고, 커밋보다 빈도가 낮은 push 시점에 전체 검사를 돌린다.

`.gitattributes` 신규 생성 (Windows에서 훅 파일이 실수로 CRLF로 바뀌어 Git Bash의 `sh`가 `$'\r': command not found` 에러를 내는 것을 방지):
```
.husky/* text eol=lf
```

`package.json`에 `lint-staged` 필드 추가:
```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,mdx,css,yml,yaml}": ["prettier --write"]
}
```

### 5. 기타 추천 도구 — EditorConfig, VS Code 설정

`.editorconfig` 신규 생성:
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

`.vscode/settings.json` 신규 생성:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.useFlatConfig": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

`.vscode/extensions.json` 신규 생성:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### 6. 문서 최신화

- `CLAUDE.md` 18번째 줄: "`typecheck`, `format`, `check-all` 같은 스크립트는 `package.json`에 정의되어 있지 않다..." 서술을 새로 추가된 스크립트와 훅 구성을 반영해 갱신 (`npm run typecheck`/`format`/`format:check` 존재, pre-commit에서 lint-staged 자동 실행, pre-push에서 typecheck 자동 실행).
- `docs/nextjs-16.md`, `docs/forms-react-hook-form.md`에 남아있는 동일한 "스크립트가 없다" 취지의 서술도 함께 교체.

### 7. 최종 package.json scripts 요약

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "husky"
  }
}
```

## 선택적 권장사항 (이번 범위에서 제외)

- **commitlint**: 이미 이모지+한글 커밋 컨벤션이 `git:commit` 스킬로 관리 중이라 표준 preset과 충돌 위험이 있어 배제.
- **GitHub Actions CI** (`npm ci && npm run lint && npm run typecheck && npm run format:check`를 PR마다 실행): 강력히 권장하지만 이번 요청 범위 밖이므로 별도 작업으로 필요시 진행.
- **`next.config.ts`의 `typedRoutes` 등 Next 16 부가 옵션**: `cacheComponents`와 별개 관심사이자 요청 범위 밖.

## 검증 방법

1. `npm install` — 신규 devDependency 설치 확인.
2. `npm run lint` — 기존 코드에 새 규칙(eslint-config-prettier 추가)으로 인한 에러 없는지 확인.
3. `npm run format:check` → 위반 있으면 `npm run format`으로 실제 정리 후 diff 확인 (Tailwind 클래스 정렬이 의도대로 동작하는지 `components/ui/button.tsx` 등에서 확인).
4. `npm run typecheck` — 통과 확인.
5. 더미 파일을 하나 수정 후 `git add` → `git commit`으로 pre-commit 훅(lint-staged)이 실제로 동작하는지 확인 (Windows PowerShell 환경에서 훅이 정상 실행되는지, LF 이슈 없는지 확인).
6. `git push`(또는 `git push --dry-run`이 없으므로 실제로는 훅만 트리거되는지 `.husky/pre-push`를 직접 `sh .husky/pre-push`로 실행해 확인)로 pre-push 훅에서 typecheck가 도는지 확인.
7. VS Code를 사용 중이라면 파일 저장 시 자동 포맷/ESLint fix가 적용되는지 확인.
