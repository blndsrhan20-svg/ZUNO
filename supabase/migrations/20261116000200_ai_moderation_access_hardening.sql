-- Explicitly deny browser access to moderation evidence; trusted server role handles it.
drop policy if exists "ai moderation deny client" on public.ai_moderation_logs;
create policy "ai moderation deny client" on public.ai_moderation_logs
for all to anon, authenticated using (false) with check (false);
