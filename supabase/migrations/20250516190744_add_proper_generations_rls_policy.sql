-- Enable RLS on generations table if not already enabled
alter table generations enable row level security;

-- Drop temporary policies
drop policy if exists "Enable insert for authenticated users" on generations;
drop policy if exists "Enable select for authenticated users" on generations;

-- Create proper user-based policies
create policy "Users can insert their own generations"
  on generations
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own generations"
  on generations
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own generations"
  on generations
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
