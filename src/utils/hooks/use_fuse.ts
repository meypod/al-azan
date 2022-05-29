import Fuse from 'fuse.js';
import {useMemo, useState} from 'react';
/**
 * A React Hook that filters an array using the Fuse.js fuzzy-search library.
 *
 * @param list The array to filter.
 * @param searchTerm The search term to filter by.
 * @param fuseOptions Options for Fuse.js.
 *
 * @returns The filtered array.
 *
 * @see https://fusejs.io/
 */
function useFuse<T>(list: T[] | undefined, fuseOptions?: Fuse.IFuseOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  const fuse = useMemo(() => {
    return new Fuse(list || [], fuseOptions);
  }, [list, fuseOptions]);

  const results = useMemo(() => {
    if (!searchTerm) return list || [];
    return fuse.search(searchTerm).map(i => i.item);
  }, [fuse, searchTerm, list]);

  return {results, setSearchTerm, searchTerm};
}

export default useFuse;
