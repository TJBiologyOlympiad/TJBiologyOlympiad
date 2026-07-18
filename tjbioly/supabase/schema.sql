-- TJ Biology Olympiad — Supabase schema
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
-- Also create a PUBLIC Storage bucket named "profiles" for officer avatars.

-- ── User (already created by the auth callback the first time someone logs in) ──
-- Ensure the officer-profile columns exist.
alter table if exists "User"
  add column if not exists "pfpUrl" text,
  add column if not exists "bio" text;

-- If the User table does not exist yet, create it:
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

-- ── Attendance ──
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

-- ── Notifications ──
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
