import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { useState, useEffect } from 'react';
import { searchAnilist } from '../api/anilistApi';
import { searchMediaFn } from '../api/trackerApi';
import { IMediaDocument } from '../types';

export default function useSearch(
  type: string,
  search: string = '',
  ids?: number[],
  page: number = 1,
  perPage: number = 10
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

  return useQuery<IMediaDocument[] | undefined, Error>({
    queryKey: ['searchMedia', debouncedSearch, type, page, perPage, ids],
    queryFn: () => {
      switch (type) {
        case 'anime':
          return searchAnilist(
            debouncedSearch,
            'ANIME',
            page,
            perPage,
            undefined,
            ids
          );
        case 'manga':
          return searchAnilist(
            debouncedSearch,
            'MANGA',
            page,
            perPage,
            'MANGA',
            ids
          );
        case 'reading':
          return searchAnilist(
            debouncedSearch,
            'MANGA',
            page,
            perPage,
            'NOVEL',
            ids
          );
        case 'vn':
          return searchMediaFn({
            type,
            search,
            ids,
            page,
            perPage,
          });
        default:
          return [];
      }
    },
    enabled: debouncedSearch.trim().length > 0,
  });
}
