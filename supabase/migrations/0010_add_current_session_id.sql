-- Add current_session_id to profiles to enforce single-device active session.
-- When a user logs in on a new device, a new session ID is generated and saved here,
-- automatically invalidating any previous device's active session.
do $$
declare
  target record;
begin
  for target in
    select * from (values
      ('public', 'profiles'),
      ('prepai', 'profiles'),
      ('public', 'prepai_profiles')
    ) as tables(schema_name, table_name)
  loop
    if to_regclass(format('%I.%I', target.schema_name, target.table_name)) is null then
      continue;
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = target.schema_name
        and table_name = target.table_name
        and column_name = 'current_session_id'
    ) then
      execute format(
        'alter table %I.%I add column current_session_id text',
        target.schema_name,
        target.table_name
      );
    end if;
  end loop;
end $$;
