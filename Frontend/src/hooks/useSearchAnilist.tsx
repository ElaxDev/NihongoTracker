import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { useState, useEffect } from 'react';
import { searchAnilist } from '../api/anilistApi';
import { AnilistSearchResult } from '../types';

export function useSearchAnilist(
  search: string,
  type?: string,
  page: number = 1,
  perPage: number = 10,
  format?: string,
  ids?: number[] | number
) {
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const debouncer = debounce(
      (nextValue: string) => setDebouncedSearch(nextValue),
      500
    );
    debouncer(search);

    return () => {
      debouncer.cancel();
    };
  }, [search]);

  return useQuery<AnilistSearchResult, Error>({
    queryKey: [
      'searchAnilist',
      debouncedSearch,
      type,
      page,
      perPage,
      format,
      ids,
    ],
    queryFn: () =>
      searchAnilist(debouncedSearch, type, page, perPage, format, ids),
    enabled: debouncedSearch.trim().length > 0,
  });
}
