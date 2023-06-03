import {useMemo, useState} from 'react';
import {normalizeLetters} from '../normalize';

const cmp = new Intl.Collator([
  'en',
  'fa',
  'ar',
  'tr',
  'id',
  'fr',
  'ur',
  'hi',
  'de',
  'bs',
  'vi',
  'bn',
]).compare;

// some of this code is taken from uFuzzy (https://github.com/leeoniya/uFuzzy/blob/main/src/uFuzzy.js)

export function prepareForSearch(str: string) {
  return normalizeLetters(str.toLocaleUpperCase());
}

/** returns the matched string inside a string that has elements that are separated by delimiter */
export function returnMatched(
  values: string,
  needle: string,
  delimeterOfValues = ',',
) {
  const split = values.split(delimeterOfValues);
  const result = search({
    originalData: split,
    preparedData: split.map(prepareForSearch),
    needle,
    limit: 1,
  });
  // NOTE: it can cause unexpected results
  if (!result.length) {
    result.push({value: split[0], index: 0});
  }
  result[0].firstValue = split[0];
  return result[0];
}

export type UseFastSearchOptions = {
  keys?: string[];
  limit?: number;
};

export type SearchResult = {
  /** original index of result */
  index: number;
  value: string;
  /** first value of returned matched string in delimiter separated strings */
  firstValue?: string;
  indexOf?: number;
  keyIndex?: number;
};

function countPipesBeforeIndex(str: string, wordIndex: number) {
  let count = 0;
  let currentIndex = str.indexOf('|');

  if (currentIndex === -1) return count;

  while (currentIndex > 0 && currentIndex < wordIndex) {
    count++;
    currentIndex = str.substring(currentIndex + 1).indexOf('|');
  }

  return count;
}

/**
 * @param preparedData - string array prepared by prepareForSearch function
 */
function search({
  originalData,
  preparedData,
  needle,
  limit = 5,
  keys,
}: {
  originalData?: Array<any>;
  preparedData: Array<string>;
  needle: string;
  limit?: number;
  keys?: UseFastSearchOptions['keys'];
}) {
  const preparedNeedle = prepareForSearch(needle);
  const results: Array<SearchResult> = [];
  for (const [index, value] of preparedData.entries()) {
    const indexOf = value.indexOf(preparedNeedle);
    if (indexOf !== -1) {
      const res: Partial<SearchResult> = {
        index,
        indexOf,
      };
      if (keys?.length) {
        res.keyIndex = countPipesBeforeIndex(value, indexOf);
        const matched = returnMatched(
          (originalData![index] as any)[keys[res.keyIndex]],
          preparedNeedle,
        );
        res.value = matched.value;
        res.indexOf = matched.indexOf;
        res.firstValue = matched.firstValue;
      } else {
        res.value = originalData ? originalData[index] : value;
      }
      results.push(res as (typeof results)[0]);
    }
  }

  results.sort(
    (a, b) =>
      a.indexOf! - b.indexOf! ||
      a.value.length - b.value.length ||
      cmp(a.value, b.value),
  );

  return results.splice(0, limit);
}

/**
 * @param data - this data must have been prepared with `prepareForSearch` function if it's an string array
 */
export function useFastSearch<T>(
  data: Array<T> | undefined,
  {keys, limit = 5}: UseFastSearchOptions = {},
) {
  const [term, setSearchTerm] = useState<string>('');

  const dataToSearch = useMemo(() => {
    if (keys && keys.length && data?.length && typeof data[0] === 'object') {
      return data
        .map(d => keys.map(k => (d as any)[k]).join('|'))
        .map(prepareForSearch);
    } else if (data?.length && typeof data[0] === 'string') {
      return data as string[];
    }
    return [];
  }, [data, keys]);

  const results: SearchResult[] = useMemo(() => {
    if (data?.length) {
      if (term) {
        const searchResult = search({
          originalData: data,
          preparedData: dataToSearch,
          needle: term,
          limit,
          keys,
        });

        if (searchResult && data?.length) {
          return searchResult;
        }
      } else {
        return dataToSearch.slice(0, limit + 250).map((_, index) => {
          const res: Partial<SearchResult> = {
            index,
            indexOf: 0,
          };
          if (keys?.length) {
            res.keyIndex = 0;
            const matched = (data![index] as any)[keys[res.keyIndex]].split(
              ',',
            )[0];
            res.value = matched;
            res.indexOf = 0;
          } else {
            res.value = data[index] as string;
          }
          return res as SearchResult;
        });
      }
    }

    return [];
  }, [term, limit, data, dataToSearch, keys]);

  return {results, setSearchTerm, term};
}

export function mapToData<T>(searchResults: SearchResult[], data: T[]) {
  return searchResults.map(sr => data[sr.index]);
}

export default useFastSearch;
