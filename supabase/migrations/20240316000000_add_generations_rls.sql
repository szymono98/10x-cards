-- Drop existing policies if they exist
drop policy if exists "Users can insert their own generations" on "public"."generations";
drop policy if exists "Users can view their own generations" on "public"."generations";
drop policy if exists "Users can update their own generations" on "public"."generations";

-- Enable RLS
alter table "public"."generations" enable row level security;

-- Create policies
create policy "Users can insert their own generations"
  on "public"."generations"
  for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own generations"
  on "public"."generations"
  for select
  using (auth.uid() = user_id);

create policy "Users can update their own generations"
  on "public"."generations"
  for update
  using (auth.uid() = user_id);
