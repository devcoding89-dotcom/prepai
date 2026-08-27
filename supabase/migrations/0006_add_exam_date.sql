-- Add exam_date to profiles so students can set when they sit their exam.
-- Powers the dashboard countdown. Nullable: the countdown simply hides when
-- no date is set. Works for public, prepai, and public.prepai_* installs —
-- only tables that actually belong to PrepAI are touched.
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
        and column_name = 'exam_date'
    ) then
      execute format(
        'alter table %I.%I add column exam_date date',
        target.schema_name,
        target.table_name
      );
    end if;
  end loop;
end $$;