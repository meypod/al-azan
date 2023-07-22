import {loadFile} from './load_file';

export type CountryInfo = {
  code: string;
  /** comma seperated alternative names */
  names: string;
  /** English name */
  name: string;
  /** user selected name from search */
  selectedName?: string;
};

export async function getCountries(): Promise<CountryInfo[]> {
  const text = await loadFile(
    require('@/assets/geocoding/countries_haystack.txt'),
  );
  const countries = text
    .trim()
    .split('\n')
    .map(line => line.split('|'))
    .map(([code, names]) => ({
      code,
      names,
      name: names.split(',')[0],
    }));

  return countries;
}

export type CityInfo = {
  /** latin name */
  name: string;
  names: string;
  lat: string;
  lng: string;
  country: string;
  /** user selected name from search */
  selectedName?: string;
};

export async function getCities(countryCode: string): Promise<CityInfo[]> {
  const text = await loadFile(
    require('@/assets/geocoding/cities_haystack.txt'),
  );
  const cities = text
    .trim()
    .split('\n')
    .filter(l => l.endsWith(countryCode))
    .map(line => line.split('|'))
    .map(([names, lat, lng, country]) => ({
      name: names.split(',')[0],
      names,
      lat,
      lng,
      country,
    }));

  return cities;
}
