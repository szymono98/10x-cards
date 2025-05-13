-- Enable RLS
alter table "public"."generations" enable row level security;
alter table "public"."generation_error_logs" enable row level security;
alter table "public"."flashcards" enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow anonymous insert on generations" on "public"."generations";
drop policy if exists "Allow authenticated insert on generations" on "public"."generations";
drop policy if exists "Allow anonymous select own generations" on "public"."generations";
drop policy if exists "Allow authenticated select own generations" on "public"."generations";
drop policy if exists "Allow anonymous update own generations" on "public"."generations";
drop policy if exists "Allow authenticated update own generations" on "public"."generations";

-- Policies for generations table
create policy "Allow anonymous insert on generations"
  on "public"."generations"
  for insert
  to anon
  with check (
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

create policy "Allow authenticated insert on generations"
  on "public"."generations"
  for insert
  to authenticated
  with check (
    auth.uid() = user_id::uuid
  );

create policy "Allow anonymous select own generations"
  on "public"."generations"
  for select
  to anon
  using (
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

create policy "Allow authenticated select own generations"
  on "public"."generations"
  for select
  to authenticated
  using (
    auth.uid() = user_id::uuid
  );

create policy "Allow anonymous update own generations"
  on "public"."generations"
  for update
  to anon
  using (
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  )
  with check (
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

create policy "Allow authenticated update own generations"
  on "public"."generations"
  for update
  to authenticated
  using (
    auth.uid() = user_id::uuid
  )
  with check (
    auth.uid() = user_id::uuid
  );

-- Policies for flashcards table
create policy "Allow anonymous insert on flashcards"
  on "public"."flashcards"
  for insert
  to anon
  with check (
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

create policy "Allow authenticated insert on flashcards"
  on "public"."flashcards"
  for insert
  to authenticated
  with check (
    auth.uid() = user_id::uuid
  );

create policy "Allow anonymous select own flashcards"
  on "public"."flashcards"
  for select
  to anon
  using (
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

create policy "Allow authenticated select own flashcards"
  on "public"."flashcards"
  for select
  to authenticated
  using (
    auth.uid() = user_id::uuid
  );

create policy "Allow anonymous update own flashcards"
  on "public"."flashcards"
  for update
  to anon
  using (
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  )
  with check (
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

create policy "Allow authenticated update own flashcards"
  on "public"."flashcards"
  for update
  to authenticated
  using (
    auth.uid() = user_id::uuid
  )
  with check (
    auth.uid() = user_id::uuid
  );

-- Policies for error logs table
create policy "Allow anonymous insert on error logs"
  on "public"."generation_error_logs"
  for insert
  to anon
  with check (
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

create policy "Allow authenticated insert on error logs"
  on "public"."generation_error_logs"
  for insert
  to authenticated
  with check (
    auth.uid() = user_id::uuid
  );

create policy "Allow anonymous select own error logs"
  on "public"."generation_error_logs"
  for select
  to anon
  using (
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

create policy "Allow authenticated select own error logs"
  on "public"."generation_error_logs"
  for select
  to authenticated
  using (
    auth.uid() = user_id::uuid
  );