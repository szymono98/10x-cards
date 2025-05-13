-- Create the flashcards table
create table if not exists "public"."flashcards" (
    "id" bigint generated always as identity primary key,
    "generation_id" bigint not null,
    "user_id" uuid not null,
    "front" text not null,
    "back" text not null,
    "source" text not null,
    "created_at" timestamptz not null default now(),
    "updated_at" timestamptz not null default now(),
    foreign key ("generation_id") references public.generations (id) on delete cascade
);

-- Add indexes for better query performance
create index if not exists flashcards_user_id_idx on public.flashcards (user_id);
create index if not exists flashcards_generation_id_idx on public.flashcards (generation_id);