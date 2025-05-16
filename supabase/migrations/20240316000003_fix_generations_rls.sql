-- Najpierw usuwamy wszystkie istniejące polityki
drop policy if exists "Users can insert their own generations" on "public"."generations";
drop policy if exists "Users can view their own generations" on "public"."generations";
drop policy if exists "Users can update their own generations" on "public"."generations";
drop policy if exists "Users can insert source_text into generations" on "public"."generations";
drop policy if exists "Users can view source_text in generations" on "public"."generations";

-- Wyłączamy i włączamy ponownie RLS
alter table "public"."generations" disable row level security;
alter table "public"."generations" enable row level security;

-- Tworzymy nową, bardziej permisywną politykę
create policy "Enable all operations for authenticated users"
  on "public"."generations"
  for all -- zamiast osobnych polityk dla insert/select/update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Upewniamy się, że zalogowani użytkownicy mają dostęp
grant all on "public"."generations" to authenticated;
