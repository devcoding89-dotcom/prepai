-- Ensure textbook files uploaded by the server can be viewed by subscribers.
-- Safe to run after any of the earlier PrepAI migrations.

insert into storage.buckets (id, name, public)
values ('textbooks', 'textbooks', true)
on conflict (id) do update set public = true;

drop policy if exists "public read textbooks bucket" on storage.objects;
create policy "public read textbooks bucket" on storage.objects
  for select using (bucket_id = 'textbooks');

-- Uploads use the server-side service-role client, which bypasses storage RLS.