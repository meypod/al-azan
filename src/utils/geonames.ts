import {URL, URLSearchParams} from 'react-native-url-polyfill';

const baseURL = 'https://secure.geonames.org/';
const username = 'meypod';
const responseStyle = 'short';
const responseType = 'json';
const maxRows = 10;

function getBaseSearchParams() {
  const baseSearchParams = new URLSearchParams();
  baseSearchParams.set('username', username);
  baseSearchParams.set('style', responseStyle);
  baseSearchParams.set('type', responseType);
  baseSearchParams.set('maxRows', maxRows.toString());
  return baseSearchParams;
}

type GeonamesResponse<T> = {
  geonames: T;
  status?: {
    message?: string;
  };
  value?: number;
  totalResultsCount?: number;
};

function throwIfMalformed(response: GeonamesResponse<unknown>) {
  if (response.status && response.value) {
    throw new Error('Service limit reached');
  }
}

export type CountryInfo = {
  countryCode: string;
  countryName: string;
};

export async function getCountries(options: {
  locale?: string;
}): Promise<CountryInfo[]> {
  const url = new URL('/countryInfo', baseURL);
  const searchParams = getBaseSearchParams();
  if (options.locale) {
    searchParams.set('lang', options.locale);
  }
  const request = new Request(`${url}?${searchParams}`);
  const resp = (await fetch(request).then(r => r.json())) as GeonamesResponse<
    Array<CountryInfo>
  >;
  throwIfMalformed(resp);
  return resp.geonames;
}

export type SearchResult = {
  lng: string;
  lat: string;
  countryCode: string;
  name: string;
  geonameId: number;
};

export async function search(options: {
  countryCode: string;
  term: string;
  locale?: string;
  abortControllerSignal: AbortSignal;
}) {
  const url = new URL('/search', baseURL);
  const searchParams = getBaseSearchParams();
  searchParams.set('country', options.countryCode);
  searchParams.set('name', options.term);
  if (options.locale) {
    searchParams.set('lang', options.locale);
  }
  const request = new Request(`${url}?${searchParams}`, {
    signal: options.abortControllerSignal,
  });
  const resp = (await fetch(request).then(r => r.json())) as GeonamesResponse<
    Array<SearchResult>
  >;

  return resp.geonames;
}
