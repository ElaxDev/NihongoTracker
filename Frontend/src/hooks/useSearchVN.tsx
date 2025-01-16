import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { useState, useEffect } from 'react';
import { searchVNFn } from '../api/trackerApi';
import { IVNDocument } from '../types';

export function useSearchVN(search: string) {
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

  return useQuery<IVNDocument[], Error>({
    queryKey: ['searchVN', debouncedSearch],
    queryFn: () => searchVNFn({ title: debouncedSearch }),
    enabled: debouncedSearch.trim().length > 0,
  });
}
