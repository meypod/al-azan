import {debounce} from 'lodash';
import {
  HStack,
  Input,
  IStackProps,
  VStack,
  Box,
  Spinner,
  Text,
  Button,
  CloseIcon,
  FormControl,
  WarningOutlineIcon,
} from 'native-base';
import {useCallback} from 'react';
import {AutocompleteInput} from '@/components/AutocompleteInput';
import {
  LOCATION_CITY,
  LOCATION_COUNTRY,
  LOCATION_LAT,
  LOCATION_LONG,
} from '@/constants/settings';
import {useStoreHelper} from '@/store/settings';
import {getCached} from '@/utils/cached';
import {
  CountryInfo,
  getCountries,
  search,
  SearchResult,
} from '@/utils/geonames';
import {useAction} from '@/utils/hooks/use_action';

export function LocationSettings(props: IStackProps) {
  const [lat, setLat] = useStoreHelper<number>(LOCATION_LAT);
  const [long, setLong] = useStoreHelper<number>(LOCATION_LONG);
  const [selectedCountry, setSelectedCountry] = useStoreHelper<
    CountryInfo | undefined
  >(LOCATION_COUNTRY);

  const [selectedCity, setSelectedCity] = useStoreHelper<
    SearchResult | undefined
  >(LOCATION_CITY);

  const {
    pending: isLoadingCountries,
    result: countries,
    runAction: getCountriesAction,
    error: getCountryError,
  } = useAction(() => getCached('countries', getCountries));

  const {
    pending: isLoadingCities,
    result: citiesSearchResult,
    runAction: searchCitiesAction,
    error: searchCitiesError,
  } = useAction((term: string, signal: AbortSignal) =>
    search(selectedCountry?.countryCode!, term, signal),
  );

  const onCountrySelected = useCallback(
    (country: CountryInfo) => {
      setSelectedCountry(country);
    },
    [setSelectedCountry],
  );

  const onChangeText = useCallback(() => {
    if (!countries) getCountriesAction();
  }, [countries, getCountriesAction]);

  const onCitySelected = useCallback(
    (result: SearchResult) => {
      setSelectedCity(result);
      setLong(parseFloat(result.lng));
      setLat(parseFloat(result.lat));
    },
    [setSelectedCity, setLong, setLat],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onCitiesChangeText = useCallback(
    debounce((term: string) => {
      searchCitiesAction(term);
    }, 400),
    [searchCitiesAction],
  );

  return (
    <VStack {...props}>
      <HStack display="flex" flexGrow={0}>
        <FormControl
          display="flex"
          width={selectedCountry ? '1/3' : '100%'}
          isInvalid={!!getCountryError}>
          <FormControl.Label>Country</FormControl.Label>
          <HStack alignItems="center" justifyContent="space-between" mb="2">
            {selectedCountry ? (
              <Text borderBottomWidth="1" borderColor="coolGray.500">
                {selectedCountry.countryCode}
              </Text>
            ) : undefined}
            {!selectedCountry && (
              <AutocompleteInput<CountryInfo>
                data={countries}
                isInsideScrollView={true}
                onItemSelected={onCountrySelected}
                getOptionLabel={item => item.countryName}
                getOptionKey={item => item.countryCode}
                autoCompleteKeys={['countryCode', 'countryName']}
                onChangeText={onChangeText}
                height="8"></AutocompleteInput>
            )}
            {isLoadingCountries && <Spinner />}
          </HStack>
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            Could not load countries
          </FormControl.ErrorMessage>
        </FormControl>

        {selectedCountry && (
          <FormControl
            width={selectedCity ? undefined : '2/3'}
            flexGrow={1}
            isInvalid={!!searchCitiesError}>
            <FormControl.Label>City/Area</FormControl.Label>
            <HStack alignItems="center" justifyContent="space-between" mb="2">
              {selectedCity ? (
                <Text borderBottomWidth="1" borderColor="coolGray.500">
                  {selectedCity.name}
                </Text>
              ) : undefined}
              {!selectedCity && (
                <AutocompleteInput<SearchResult>
                  data={citiesSearchResult}
                  isInsideScrollView={true}
                  onItemSelected={onCitySelected}
                  getOptionKey={item => item.geonameId.toString()}
                  getOptionLabel={item => item.name}
                  autoCompleteKeys={['name']}
                  onChangeText={onCitiesChangeText}
                  height="8"></AutocompleteInput>
              )}
              {isLoadingCities && <Spinner pl="1" />}
            </HStack>
            <FormControl.ErrorMessage
              leftIcon={<WarningOutlineIcon size="xs" />}>
              Could not load search results
            </FormControl.ErrorMessage>
          </FormControl>
        )}
        <Box pb="2" justifyContent="flex-end">
          {(selectedCountry || selectedCity) && (
            <Button
              height={8}
              width={8}
              variant="ghost"
              onPress={() => {
                setSelectedCountry(undefined);
                setSelectedCity(undefined);
              }}>
              <CloseIcon />
            </Button>
          )}
        </Box>
      </HStack>

      <HStack>
        <FormControl width="1/2" pr="1">
          <FormControl.Label>Latitude</FormControl.Label>
          <Input
            height="8"
            placeholder="latitude"
            value={lat?.toString() || '-'}
            keyboardType="number-pad"
            onChangeText={(str: string) => setLat(parseFloat(str))}
          />
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            Latitude is invalid
          </FormControl.ErrorMessage>
        </FormControl>
        <FormControl width="1/2" pl="1">
          <FormControl.Label>Longitude</FormControl.Label>
          <Input
            py="0"
            height="8"
            placeholder="longitude"
            value={long?.toString() || '-'}
            keyboardType="number-pad"
            onChangeText={(str: string) => setLong(parseFloat(str))}
          />
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            Longitude is invalid
          </FormControl.ErrorMessage>
        </FormControl>
      </HStack>
    </VStack>
  );
}
