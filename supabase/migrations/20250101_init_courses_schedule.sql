-- Enable required extensions
create extension if not exists pgcrypto;

-- COURSES TABLE
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_code text unique not null,
  faculty_id uuid references public.profiles(id),
  tags text[],
  description text,
  deadline date,
  credit_hours integer,
  thumbnail_url text,
  external_link text,
  assigned_student_ids text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_courses_updated_at on public.courses;
create trigger trg_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

-- Row Level Security and policies
alter table public.courses enable row level security;

-- Allow authenticated users to read courses
create policy if not exists courses_select_auth
on public.courses for select
using ( auth.role() = 'authenticated' );

-- Allow faculty to insert their courses
create policy if not exists courses_insert_faculty
on public.courses for insert
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and (p.role = 'faculty' or p.role = 'admin')
      and (new.faculty_id is null or p.id = new.faculty_id)
  )
);

-- Allow faculty to update/delete their own courses
create policy if not exists courses_update_faculty
on public.courses for update
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and (p.role = 'faculty' or p.role = 'admin')
      and p.id = faculty_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and (p.role = 'faculty' or p.role = 'admin')
      and p.id = faculty_id
  )
);

create policy if not exists courses_delete_faculty
on public.courses for delete
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and (p.role = 'faculty' or p.role = 'admin')
      and p.id = faculty_id
  )
);

-- SCHEDULE TABLE
create table if not exists public.schedule (
  id uuid primary key default gen_random_uuid(),
  course_name text not null,
  start timestamptz not null,
  "end" timestamptz not null,
  room text,
  tags text[],
  syllabus_url text,
  students_count integer default 0,
  notes text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists trg_schedule_updated_at on public.schedule;
create trigger trg_schedule_updated_at
before update on public.schedule
for each row execute function public.set_updated_at();

alter table public.schedule enable row level security;

-- Allow authenticated users to read schedule
create policy if not exists schedule_select_auth
on public.schedule for select
using ( auth.role() = 'authenticated' );

-- Allow faculty to manage schedule entries
create policy if not exists schedule_modify_faculty
on public.schedule for all
using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and (p.role = 'faculty' or p.role = 'admin'))
)
with check (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and (p.role = 'faculty' or p.role = 'admin'))
);

-- STORAGE BUCKET FOR COURSE THUMBNAILS
insert into storage.buckets (id, name, public)
values ('course_thumbnails','course_thumbnails', true)
on conflict (id) do nothing;

-- Storage policies for the bucket
create policy if not exists "Public read access to course_thumbnails"
on storage.objects for select
using ( bucket_id = 'course_thumbnails' );

create policy if not exists "Authenticated users can upload to course_thumbnails"
on storage.objects for insert
with check ( bucket_id = 'course_thumbnails' and auth.role() = 'authenticated' );

create policy if not exists "Owners or faculty can update/delete course_thumbnails"
on storage.objects for update using (
  bucket_id = 'course_thumbnails' and auth.role() = 'authenticated'
) with check (
  bucket_id = 'course_thumbnails' and auth.role() = 'authenticated'
);
