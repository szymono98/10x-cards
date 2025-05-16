-- Drop existing policies if they exist
drop policy if exists "Users can insert their own flashcards" on "public"."flashcards";
drop policy if exists "Users can view their own flashcards" on "public"."flashcards";
drop policy if exists "Users can update their own flashcards" on "public"."flashcards";

-- Enable RLS
alter table "public"."flashcards" enable row level security;

-- Create policies
create policy "Users can insert their own flashcards"
  on "public"."flashcards"
  for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own flashcards"
  on "public"."flashcards"
  for select
  using (auth.uid() = user_id);

create policy "Users can update their own flashcards"
  on "public"."flashcards"
  for update
  using (auth.uid() = user_id);
