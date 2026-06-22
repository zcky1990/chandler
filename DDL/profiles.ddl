-- Profil pengguna terhubung ke auth.users (satu baris per akun login)

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Allow public read on profiles"
  on public.profiles for select
  using (true);

create policy "Allow users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Allow users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Otomatis buat baris profiles saat user baru mendaftar di Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill untuk user yang sudah ada sebelum DDL ini dijalankan
insert into public.profiles (id, full_name, email)
select
  id,
  coalesce(raw_user_meta_data->>'full_name', ''),
  email
from auth.users
on conflict (id) do nothing;
