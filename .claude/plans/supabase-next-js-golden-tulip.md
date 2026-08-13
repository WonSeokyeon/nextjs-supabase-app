# profiles 테이블 생성 계획

## Context

이 프로젝트는 Next.js 15 (App Router) + Supabase(`@supabase/ssr`) 조합으로, 회원가입/로그인은 이미 구현되어 있지만(`components/sign-up-form.tsx`, `components/login-form.tsx`) 이메일/비밀번호만 다룰 뿐 사용자의 추가 정보(닉네임, 이름, 아바타 등)를 저장할 공간이 없다. `auth.users`는 Supabase Auth가 내부적으로 관리하는 테이블이라 직접 확장하거나 애플리케이션에서 자유롭게 컬럼을 추가할 수 없으므로, 표준적인 Supabase 패턴에 따라 `public.profiles` 테이블을 만들어 `auth.users`와 1:1로 연결하고 회원가입 시 자동으로 프로필 행이 생성되도록 한다.

원격 프로젝트(`bkhykwdpxapfkhjdwxlx`)를 조사한 결과, `public` 스키마에는 튜토리얼용 `instruments` 테이블만 있고 `profiles`/마이그레이션 기록은 전혀 없다. 로컬에 `supabase/` 디렉터리(CLI 설정)도 없으므로, MCP의 `apply_migration` 도구로 원격 프로젝트에 직접 마이그레이션을 적용하는 방식을 사용한다(이 방식도 `supabase_migrations` 스키마에 이력이 남아 `list_migrations`로 추적 가능).

사용자 결정사항:
- 컬럼: 기본형(`username`, `full_name`, `avatar_url`) + `id`, `created_at`, `updated_at`
- RLS: 공개 프로필 — 누구나 SELECT 가능, 본인만 INSERT/UPDATE 가능 (Supabase 공식 User Management 예제와 동일한 패턴)

## 구현 단계

### 1. 마이그레이션 작성 및 적용 (`mcp__supabase__apply_migration`)

이름: `create_profiles_table`

```sql
-- profiles 테이블: auth.users와 1:1 매핑되는 공개 프로필
create table public.profiles (
  id uuid not null primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint username_length check (char_length(username) >= 3)
);

comment on table public.profiles is '회원가입한 사용자의 공개 프로필 정보';

-- RLS 활성화
alter table public.profiles enable row level security;

-- 공개 프로필: 누구나 조회 가능
create policy "profiles_select_public"
  on public.profiles for select
  to authenticated, anon
  using (true);

-- 본인 프로필만 삽입 가능
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- 본인 프로필만 수정 가능
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- updated_at 자동 갱신 트리거
create function public.handle_profiles_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_profiles_updated_at();

-- 회원가입 시 auth.users -> profiles 자동 동기화 트리거
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

핵심 설계 포인트:
- RLS 정책에서 `(select auth.uid())`처럼 서브쿼리로 감싸는 것은 Supabase 공식 권장 최적화(행마다 재평가되지 않고 쿼리당 1회만 평가됨).
- `handle_new_user()`는 `security definer`로 실행되어야 트리거가 `auth.users`에 INSERT될 때 RLS 정책(본인만 INSERT 가능)에 걸리지 않고 `profiles` 행을 대신 생성할 수 있다.
- `on delete cascade`로 Auth 사용자가 삭제되면 프로필도 함께 삭제된다.

### 2. TypeScript 타입 생성 및 반영

- `mcp__supabase__generate_typescript_types`로 최신 스키마 타입을 가져와 `lib/supabase/database.types.ts`로 저장.
- `lib/supabase/client.ts`, `lib/supabase/server.ts`에서 `createBrowserClient`/`createServerClient` 호출을 `createBrowserClient<Database>(...)`/`createServerClient<Database>(...)`로 제네릭 타입 지정하고 `Database` 타입을 import.

### 3. 검증

- `mcp__supabase__list_tables`로 `public.profiles` 생성 및 RLS 활성화 확인.
- `mcp__supabase__get_advisors`(security)로 RLS 정책 관련 경고가 없는지 확인.
- `mcp__supabase__execute_sql`로 간단한 조회(`select * from public.profiles limit 5;`) 테스트.
- 가능하면 앱에서 회원가입 플로우(`/auth/sign-up`)를 실제로 실행해, 가입 직후 `profiles` 테이블에 트리거로 행이 자동 생성되는지 `execute_sql`로 확인.

---

# 후속 문제 해결: 로그인 후 profiles에 행이 생기지 않는 문제

## Context

사용자가 로그인 후 `public.profiles`에 회원 정보가 INSERT되지 않았다고 보고했다. 원인을 읽기 전용으로 조사한 결과:

- `auth.users`에는 계정이 1개뿐이며(`tjrdus110@gmail.com`), 생성 시각은 `2026-08-13 06:38:10`이다.
- 이 계정은 **`create_profiles_table` 마이그레이션(트리거 `on_auth_user_created` 설치)이 적용되기 이전**에 이미 가입되어 있었다 — 이번 세션 초반 조사 시점에 `auth.users`가 이미 `rows: 1`이었고, `profiles` 트리거는 그 이후에 생성되었다.
- `on_auth_user_created` 트리거는 `AFTER INSERT ON auth.users`에서만 발동한다. 즉 **회원가입(신규 INSERT) 시에만 프로필이 자동 생성**되며, **로그인은 `auth.users`에 INSERT를 일으키지 않으므로** 애초에 트리거가 발동할 이유가 없다.
- 트리거 자체는 정상 설치·활성화되어 있음을 확인했다(`tgenabled = 'O'`, 정의 확인 완료). 즉 트리거 로직의 버그가 아니라, **트리거가 생기기 전에 만들어진 기존 계정에 대한 데이터 누락(backfill 필요)** 문제다.

결론: 버그가 아니라 "과거 데이터 이관 누락" 케이스. 기존 계정을 위한 1회성 backfill과, 향후 동일 상황(트리거 설치 이전 계정)에도 안전하게 재실행 가능한 멱등적 스크립트가 필요하다.

## 구현 단계

### 1. Backfill 마이그레이션 적용 (`mcp__supabase__apply_migration`)

이름: `backfill_profiles_for_existing_users`

```sql
-- 트리거 설치 이전에 가입되어 profiles 행이 없는 기존 사용자를 위한 1회성 백필
insert into public.profiles (id, full_name, avatar_url)
select
  u.id,
  u.raw_user_meta_data ->> 'full_name',
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);
```

- `where not exists`로 멱등성을 보장해 재실행해도 중복 삽입되지 않는다.
- DDL이 아닌 데이터 백필이지만, 스키마 변경 이력과 함께 추적하기 위해 `apply_migration`으로 적용해 `list_migrations`에 기록을 남긴다.

### 2. 검증

- `select * from public.profiles;`로 기존 계정(`badc69de-9a6c-4a67-8476-54a454144f24`)의 프로필 행이 생성됐는지 확인.
- `mcp__supabase__get_advisors(type: "security")`로 새 경고가 없는지 재확인.
- 앞으로의 신규 가입은 트리거가 이미 정상 동작하므로 추가 조치 불필요 — 다만 사용자가 원하면 앱에서 새 계정으로 회원가입을 한 번 테스트해 `profiles` 행이 즉시 자동 생성되는지 육안으로 확인해볼 수 있다(선택 사항).
