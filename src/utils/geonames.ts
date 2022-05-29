import {URL, URLSearchParams} from 'react-native-url-polyfill';

const baseURL = 'https://secure.geonames.org/';
const username = ''; // TODO
const responseStyle = 'short';
const responseType = 'json';
const maxRows = 10;

const baseSearchParams = new URLSearchParams();
baseSearchParams.set('username', username);
baseSearchParams.set('style', responseStyle);
baseSearchParams.set('type', responseType);
baseSearchParams.set('maxRows', maxRows.toString());

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

export async function getCountries(): Promise<CountryInfo[]> {
  const url = new URL('/countryInfo', baseURL);
  const searchParams = new URLSearchParams(baseSearchParams);
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

export async function search(
  countryCode: string,
  term: string,
  abortControllerSignal?: AbortSignal,
) {
  const url = new URL('/search', baseURL);
  const searchParams = new URLSearchParams(baseSearchParams);
  searchParams.set('country', countryCode);
  searchParams.set('name', term);
  const request = new Request(`${url}?${searchParams}`, {
    signal: abortControllerSignal,
  });
  const resp = (await fetch(request).then(r => r.json())) as GeonamesResponse<
    Array<SearchResult>
  >;

  return resp.geonames;
}
