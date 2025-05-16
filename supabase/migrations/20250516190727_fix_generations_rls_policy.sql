-- Enable RLS on generations table if not already enabled
alter table generations enable row level security;

-- Drop existing policies if any
drop policy if exists "Enable insert for authenticated users" on generations;
drop policy if exists "Enable select for authenticated users" on generations;

-- Create new policies
create policy "Enable insert for authenticated users"
  on generations
  for insert
  to authenticated
  with check (true);

create policy "Enable select for authenticated users"
  on generations
  for select
  to authenticated
  using (true);
