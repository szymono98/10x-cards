-- Enable RLS
alter table "public"."generations" enable row level security;
alter table "public"."generation_error_logs" enable row level security;
alter table "public"."flashcards" enable row level security;

-- Development policy for generations
create policy "Allow all operations for default user on generations"
  on "public"."generations"
  for all
  using (user_id = '6e61325f-0a6f-4404-8e55-f704bde8e5dd')
  with check (user_id = '6e61325f-0a6f-4404-8e55-f704bde8e5dd');

-- Development policy for error logs
create policy "Allow all operations for default user on error logs"
  on "public"."generation_error_logs"
  for all
  using (user_id = '6e61325f-0a6f-4404-8e55-f704bde8e5dd')
  with check (user_id = '6e61325f-0a6f-4404-8e55-f704bde8e5dd')

-- Development policy for flashcards
create policy "Allow all operations for default user on flashcards"
  on "public"."flashcards"
  for all
  using (user_id = '6e61325f-0a6f-4404-8e55-f704bde8e5dd')
  with check (user_id = '6e61325f-0a6f-4404-8e55-f704bde8e5dd');
