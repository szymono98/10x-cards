-- Tymczasowo wyłączamy RLS dla debugowania
alter table "public"."generations" disable row level security;

-- Dodajemy uprawnienia dla service_role
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

-- Dodajemy uprawnienia dla authenticated
grant usage on schema public to authenticated;
grant all privileges on table public.generations to authenticated;
grant all privileges on table public.flashcards to authenticated;
