-- Enable RLS
alter table "public"."generations" enable row level security;
alter table "public"."generation_error_logs" enable row level security;
alter table "public"."flashcards" enable row level security;

-- Development policy for generations
create policy "Allow all operations on generations"
  on "public"."generations"
  for all
  using (true)
  with check (true);

-- Development policy for error logs
create policy "Allow all operations on error logs"
  on "public"."generation_error_logs"
  for all
  using (true)
  with check (true);

-- Development policy for flashcards
create policy "Allow all operations on flashcards"
  on "public"."flashcards"
  for all
  using (true)
  with check (true);
