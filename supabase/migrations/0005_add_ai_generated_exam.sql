-- Allow AI-generated questions to remain separate from official exam banks.
-- The project supports public, prepai, and public.prepai_* installations.
-- Only update tables that actually belong to PrepAI; skip unrelated public tables.
do $$
declare
  target record;
  constraint_name text;
begin
  for target in
    select * from (values
      ('public', 'profiles', 'target_exam'),
      ('prepai', 'profiles', 'target_exam'),
      ('public', 'prepai_profiles', 'target_exam'),
      ('public', 'questions', 'exam'),
      ('prepai', 'questions', 'exam'),
      ('public', 'prepai_questions', 'exam'),
      ('public', 'practice_sessions', 'exam'),
      ('prepai', 'practice_sessions', 'exam'),
      ('public', 'prepai_practice_sessions', 'exam'),
      ('public', 'textbooks', 'exam'),
      ('prepai', 'textbooks', 'exam'),
      ('public', 'prepai_textbooks', 'exam')
    ) as tables(schema_name, table_name, column_name)
  loop
    if to_regclass(format('%I.%I', target.schema_name, target.table_name)) is null
      or not exists (
        select 1
        from information_schema.columns
        where table_schema = target.schema_name
          and table_name = target.table_name
          and column_name = target.column_name
      ) then
      continue;
    end if;

    for constraint_name in
      select con.conname
      from pg_constraint con
      where con.conrelid = to_regclass(format('%I.%I', target.schema_name, target.table_name))
        and con.contype = 'c'
        and pg_get_constraintdef(con.oid) like '%JAMB%'
        and pg_get_constraintdef(con.oid) like '%WAEC%'
        and pg_get_constraintdef(con.oid) like '%NECO%'
        and pg_get_constraintdef(con.oid) like '%' || target.column_name || '%'
    loop
      execute format('alter table %I.%I drop constraint %I', target.schema_name, target.table_name, constraint_name);
    end loop;

    execute format(
      'alter table %I.%I add constraint %I check (%I in (''JAMB'', ''WAEC'', ''NECO'', ''AI GENERATED''))',
      target.schema_name,
      target.table_name,
      target.table_name || '_' || target.column_name || '_ai_exam_check',
      target.column_name
    );
  end loop;
end $$;