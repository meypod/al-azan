import {t} from '@lingui/macro';
import {
  HStack,
  VStack,
  Text,
  CloseIcon,
  Button,
  type IStackProps,
} from 'native-base';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {AutocompleteInput} from '@/components/AutocompleteInput';
import type {LocationDetail} from '@/store/calculation';
import {CountryInfo, getCountries, getCities, CityInfo} from '@/utils/geonames';

function cityToKey(city: CityInfo) {
  return city.names + city.name + city.lat;
}

function cityToLabel(city: CityInfo) {
  return city.selectedName || city.name;
}

export type LocationSearchOption = {
  selectedLocation: LocationDetail | undefined;
  onLocationSelected: (location: LocationDetail | undefined) => void;
} & IStackProps;

export const LocationSearch = function LocationSearch({
  selectedLocation,
  onLocationSelected,
  ...props
}: LocationSearchOption) {
  const [selectedCountry, setSelectedCountry] = useState<
    CountryInfo | undefined
  >(selectedLocation?.country);
  const [selectedCity, setSelectedCity] = useState<CityInfo | undefined>(
    selectedLocation?.city,
  );

  useEffect(() => {
    setSelectedCountry(selectedLocation?.country);
    setSelectedCity(selectedLocation?.city);
  }, [selectedLocation]);

  const onClearPress = useCallback(
    () => onLocationSelected(undefined),
    [onLocationSelected],
  );

  const onCountrySelected = useCallback(
    (country: CountryInfo) => {
      setSelectedCountry(country);
      setSelectedCity(undefined);
    },
    [setSelectedCity, setSelectedCountry],
  );

  const onCitySelected = useCallback(
    (result: CityInfo) => {
      onLocationSelected({
        country: selectedCountry,
        city: result,
        lat: parseFloat(result.lat),
        long: parseFloat(result.lng),
      });
    },
    [onLocationSelected, selectedCountry],
  );

  const getCitiesData = useMemo(() => {
    if (!selectedCountry) return () => Promise.resolve([]);
    return () => getCities(selectedCountry?.code);
  }, [selectedCountry]);

  return (
    <HStack mt="2" {...props}>
      <VStack flex={2}>
        <Text mb="1" nativeID="country_label">{t`Country`}</Text>
        <AutocompleteInput<CountryInfo>
          accessibilityLabelledBy="country_label"
          actionsheetLabel={t`Country`}
          getData={getCountries}
          onItemSelected={onCountrySelected}
          getOptionLabel={item => item.selectedName || item.name}
          getOptionKey={item => item.code}
          autoCompleteKeys={['names']}
          selectedItem={selectedCountry}
          useReturnedMatch={true}
          placeholder={t`Press to search`}
          size="sm"
          px="2"
          errorMessage={t`Error in loading countries`}
        />
      </VStack>
      {selectedCountry && (
        <VStack flex={4} pl="2">
          <Text mb="1" nativeID="city_label">{t`City/Area`}</Text>
          <AutocompleteInput<CityInfo>
            accessibilityLabelledBy="city_label"
            actionsheetLabel={t`City/Area`}
            getData={getCitiesData}
            onItemSelected={onCitySelected}
            getOptionKey={cityToKey}
            getOptionLabel={cityToLabel}
            autoCompleteKeys={['names']}
            useReturnedMatch={true}
            selectedItem={selectedCity}
            placeholder={t`Press to search`}
            size="sm"
            px="2"
          />
        </VStack>
      )}
      {selectedCountry && (
        <VStack flexShrink={1} pl="2">
          <Text mb="1"> </Text>
          <Button
            flex={1}
            accessibilityLabel={t`Clear the location`}
            borderColor="danger.900"
            variant="outline"
            colorScheme="danger"
            width="10"
            onPress={onClearPress}>
            <CloseIcon />
          </Button>
        </VStack>
      )}
    </HStack>
  );
};
