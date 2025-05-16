-- Drop existing policies first
drop policy if exists "Users can insert source_text into generations" on "public"."generations";
drop policy if exists "Users can view source_text in generations" on "public"."generations";

-- Create new policies
create policy "Users can insert source_text into generations"
  on "public"."generations"
  for insert
  with check (auth.uid() = user_id);

create policy "Users can view source_text in generations"
  on "public"."generations"
  for select
  using (auth.uid() = user_id);

-- Re-enable RLS to make sure changes take effect
alter table "public"."generations" force row level security;
