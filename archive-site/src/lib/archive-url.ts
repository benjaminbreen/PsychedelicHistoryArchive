import type { ArchiveSearchParams } from "@/lib/archive-query";

type ArchiveParamKey = keyof ArchiveSearchParams;
type ArchiveParamUpdate = Partial<Record<ArchiveParamKey, string | undefined | null>>;

export function archiveQueryString(params: ArchiveSearchParams, omit: ArchiveParamKey[] = []) {
  const omitted = new Set<ArchiveParamKey>(omit);
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const paramKey = key as ArchiveParamKey;
    if (!value || omitted.has(paramKey)) return;
    searchParams.set(paramKey, value);
  });

  return searchParams.toString();
}

export function archiveHref(
  params: ArchiveSearchParams,
  updates: ArchiveParamUpdate = {},
  options: { resetPage?: boolean } = {}
) {
  const nextParams: ArchiveSearchParams = { ...params };

  Object.entries(updates).forEach(([key, value]) => {
    const paramKey = key as ArchiveParamKey;
    if (!value) {
      delete nextParams[paramKey];
      return;
    }
    nextParams[paramKey] = value;
  });

  if (options.resetPage !== false && !Object.prototype.hasOwnProperty.call(updates, "page")) {
    delete nextParams.page;
  }

  const query = archiveQueryString(nextParams);
  return query ? `/archive?${query}` : "/archive";
}

export function archiveClearFiltersHref(params: ArchiveSearchParams) {
  return archiveHref(params, {
    access: undefined,
    era: undefined,
    medium: undefined,
    people: undefined,
    q: undefined,
    region: undefined,
    tag: undefined,
    type: undefined,
    yearEnd: undefined,
    yearStart: undefined,
  });
}
