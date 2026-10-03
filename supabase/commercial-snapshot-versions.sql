create or replace function public.comercial_snapshot_versions(p_limit integer default 5)
returns table(id text, synced_at timestamptz, content_hash text)
language sql stable security invoker
set search_path = ''
as $$
  select s.id::text, s.synced_at,
    md5((s.payload #- '{raw,syncedAt}' #- '{periodo,atualizadoEm}')::text)
  from (
    select t.id, t.synced_at, t.payload
    from public.comercial_dashboard_snapshots t
    where t.source = 'pipefy'
    order by t.synced_at desc
    limit greatest(1, least(coalesce(p_limit, 5), 5))
  ) s;
$$;
revoke all on function public.comercial_snapshot_versions(integer) from public, anon;
grant execute on function public.comercial_snapshot_versions(integer) to authenticated, service_role;
notify pgrst, 'reload schema';
