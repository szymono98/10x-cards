-- Create the generations table
create table if not exists "public"."generations" (
    "id" bigint generated always as identity primary key,
    "user_id" uuid not null,
    "source_text_hash" text not null,
    "source_text_length" integer not null,
    "model" text not null,
    "generated_count" integer not null default 0,
    "generation_duration" integer not null default 0,
    "accepted_edited_count" integer not null default 0,
    "accepted_unedited_count" integer not null default 0,
    "created_at" timestamptz not null default now()
);

-- Create the generation error logs table
create table if not exists "public"."generation_error_logs" (
    "id" bigint generated always as identity primary key,
    "generation_id" bigint not null,
    "user_id" uuid not null,
    "error_message" text not null,
    "error_code" text not null,
    "model" text not null,
    "source_text_hash" text not null,
    "source_text_length" integer not null,
    "created_at" timestamptz not null default now(),
    foreign key ("generation_id") references public.generations (id) on delete cascade
);

-- Add indexes for better query performance
create index if not exists generations_user_id_idx on public.generations (user_id);
create index if not exists generation_error_logs_generation_id_idx on public.generation_error_logs (generation_id);
create index if not exists generation_error_logs_user_id_idx on public.generation_error_logs (user_id);
