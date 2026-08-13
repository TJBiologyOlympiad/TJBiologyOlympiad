alter table if exists "User"
  add column if not exists "pfpUrl" text,
  add column if not exists "bio" text;

create table if not exists "User" (
  "id" serial primary key,
  "ionId" text not null unique,
  "email" text,
  "username" text,
  "classYear" text,
  "name" text,
  "roles" text[] not null default '{user}',
  "pfpUrl" text,
  "bio" text
);

create table if not exists "AttendanceBlock" (
  "id" serial primary key,
  "blockType" text not null,
  "date" date not null,
  "code" text not null,
  "isClosed" boolean not null default false,
  "createdAt" timestamptz not null default now()
);

create table if not exists "AttendanceRecord" (
  "id" serial primary key,
  "blockId" integer not null references "AttendanceBlock"("id") on delete cascade,
  "userId" integer not null references "User"("id") on delete cascade,
  "timestamp" timestamptz not null default now(),
  unique ("blockId", "userId")
);

create table if not exists "Notification" (
  "id" serial primary key,
  "userId" integer not null references "User"("id") on delete cascade,
  "title" text not null,
  "message" text not null,
  "read" boolean not null default false,
  "link" text,
  "createdAt" timestamptz not null default now()
);

-- ── App settings (key/value) ──
create table if not exists "AppSetting" (
  "key" text primary key,
  "value" text,
  "updatedAt" timestamptz not null default now()
);

create table if not exists "POTWWeek" (
  "id" serial primary key,
  "topic" text not null,
  "description" text,
  "published" boolean not null default false,
  "createdAt" timestamptz not null default now()
);

create table if not exists "POTWProblem" (
  "id" serial primary key,
  "weekId" integer not null references "POTWWeek"("id") on delete cascade,
  "prompt" text not null,
  "choices" jsonb not null,
  "correctIndex" integer not null,
  "orderIndex" integer not null default 0
);

create table if not exists "POTWAttempt" (
  "id" serial primary key,
  "weekId" integer not null references "POTWWeek"("id") on delete cascade,
  "userId" integer not null references "User"("id") on delete cascade,
  "score" integer not null,
  "totalProblems" integer not null,
  "answers" jsonb not null,
  "violationCount" integer not null default 0,
  "awayMs" integer not null default 0,
  "submittedAt" timestamptz not null default now(),
  unique ("weekId", "userId")
);

insert into "AppSetting" ("key", "value")
values ('resourcesDriveUrl', 'https://drive.google.com/drive/folders/1FBV6o4AaeDYvkBAX48-Duq5zFJYkbPiV?usp=sharing')
on conflict ("key") do nothing;

alter table "User" enable row level security;
alter table "AttendanceBlock" enable row level security;
alter table "AttendanceRecord" enable row level security;
alter table "Notification" enable row level security;
alter table "AppSetting" enable row level security;
alter table "POTWWeek" enable row level security;
alter table "POTWProblem" enable row level security;
alter table "POTWAttempt" enable row level security;

create table if not exists "CalendarEvent" (
  "id" serial primary key,
  "title" text not null,
  "description" text,
  "date" date not null,
  "recurrence" text not null default 'none',
  "createdAt" timestamptz not null default now()
);

alter table "CalendarEvent" enable row level security;
