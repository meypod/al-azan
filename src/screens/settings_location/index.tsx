import {t} from '@lingui/macro';
import Clipboard from '@react-native-clipboard/clipboard';
import {debounce} from 'lodash';
import {
  HStack,
  Input,
  ScrollView,
  IScrollViewProps,
  Spinner,
  Text,
  Button,
  CloseIcon,
  FormControl,
  WarningOutlineIcon,
} from 'native-base';
import {useCallback, useLayoutEffect, useState} from 'react';
import {ToastAndroid} from 'react-native';
import {AutocompleteInput} from '@/components/AutocompleteInput';
import {useCalcSettingsHelper} from '@/store/calculation_settings';
import {useSettingsHelper} from '@/store/settings';
import {getCached} from '@/utils/cached';
import {
  CountryInfo,
  getCountries,
  search,
  SearchResult,
} from '@/utils/geonames';
import {useAction} from '@/utils/hooks/use_action';

function isValidCoords(num: number) {
  return num >= -180 && num <= 180;
}

const clipboardCoordsRegex = /([-\d.]+)\s*,\s*([-\d.]+)/;

export function LocationSettings(props: IScrollViewProps) {
  const [lat, setLat] = useCalcSettingsHelper('LOCATION_LAT');
  const [long, setLong] = useCalcSettingsHelper('LOCATION_LONG');
  const [tempLat, setTempLat] = useState<string>('-');
  const [tempLong, setTempLong] = useState<string>('-');
  const [selectedCountry, setSelectedCountry] =
    useSettingsHelper('LOCATION_COUNTRY');
  const [locale] = useSettingsHelper('SELECTED_LOCALE');

  useLayoutEffect(() => {
    setTempLat(lat?.toString() || '-');
    setTempLong(long?.toString() || '-');
  }, [lat, long]);

  const [selectedCity, setSelectedCity] = useSettingsHelper('LOCATION_CITY');

  const {
    pending: isLoadingCountries,
    result: countries,
    runAction: getCountriesAction,
    error: getCountryError,
  } = useAction(() =>
    getCached('countries-' + locale, () => getCountries({locale})),
  );

  const {
    pending: isLoadingCities,
    result: citiesSearchResult,
    runAction: searchCitiesAction,
    error: searchCitiesError,
  } = useAction((term: string, signal: AbortSignal) =>
    search({
      countryCode: selectedCountry?.countryCode!,
      term,
      abortControllerSignal: signal,
      locale,
    }),
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

  const onLatChangeText = (str: string) => {
    const parsedValue = parseFloat(str);
    if (!isNaN(parsedValue) && isValidCoords(parsedValue)) {
      setLat(parsedValue);
      setTempLat(parsedValue.toString());
    } else {
      setLat(undefined);
      setTempLat('-');
    }
    clearCountryAndCity();
  };
  const onLongChangeText = (str: string) => {
    let parsedValue = parseFloat(str);
    if (!isNaN(parsedValue) && isValidCoords(parsedValue)) {
      setLong(parsedValue);
      setTempLong(parsedValue.toString());
    } else {
      setLong(undefined);
      setTempLong('-');
    }
    clearCountryAndCity();
  };

  const clearCountryAndCity = () => {
    setSelectedCountry(undefined);
    setSelectedCity(undefined);
  };

  const onPasteButtonPressed = () => {
    Clipboard.getString()
      .then(str => {
        const match = str.match(clipboardCoordsRegex);
        if (match && match.length === 3) {
          onLatChangeText(match[1]);
          onLongChangeText(match[2]);
        } else {
          ToastAndroid.show(
            t`Clipboard data does not contain coordinates`,
            ToastAndroid.SHORT,
          );
        }
      })
      .catch(() => {
        ToastAndroid.show(t`Error getting clipboard data`, ToastAndroid.SHORT);
      });
  };

  return (
    <ScrollView
      p="4"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      {...props}>
      <HStack display="flex" flexGrow={0} mb="3">
        <FormControl
          display="flex"
          width={selectedCountry ? undefined : '100%'}
          isInvalid={!!getCountryError}>
          <FormControl.Label>{t`Country`}</FormControl.Label>
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
                onChangeText={onChangeText}></AutocompleteInput>
            )}
            {isLoadingCountries && <Spinner />}
          </HStack>
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {t`Error in loading countries`}
          </FormControl.ErrorMessage>
        </FormControl>

        {selectedCountry && (
          <FormControl
            ml="3%"
            width={selectedCity ? undefined : '66%'}
            flexGrow={1}
            isInvalid={!!searchCitiesError}>
            <FormControl.Label>{t`City/Area`}</FormControl.Label>
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
                  onChangeText={onCitiesChangeText}></AutocompleteInput>
              )}
              {isLoadingCities && <Spinner pl="1" />}
            </HStack>
            <FormControl.ErrorMessage
              leftIcon={<WarningOutlineIcon size="xs" />}>
              {t`Error in loading search results`}
            </FormControl.ErrorMessage>
          </FormControl>
        )}

        {(selectedCountry || selectedCity) && (
          <FormControl flex={1} flexShrink={0}>
            <FormControl.Label> </FormControl.Label>
            <Button
              mb="2"
              flex={1}
              variant="ghost"
              onPress={clearCountryAndCity}>
              <CloseIcon />
            </Button>
          </FormControl>
        )}
      </HStack>

      <HStack>
        <FormControl width="1/2" pr="1" mb="1">
          <FormControl.Label justifyContent="center">{t`Latitude`}</FormControl.Label>
          <Input
            py="0"
            fontSize="lg"
            textAlign="center"
            placeholder={t`Latitude`}
            value={tempLat?.toString()}
            keyboardType="number-pad"
            onChangeText={str => setTempLat(str)}
            onEndEditing={e => onLatChangeText(e.nativeEvent.text)}
          />
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {t`Latitude is invalid`}
          </FormControl.ErrorMessage>
        </FormControl>
        <FormControl width="1/2" pl="1">
          <FormControl.Label justifyContent="center">{t`Longitude`}</FormControl.Label>
          <Input
            py="0"
            fontSize="lg"
            textAlign="center"
            placeholder={t`Longitude`}
            value={tempLong?.toString()}
            onChangeText={str => setTempLong(str)}
            keyboardType="number-pad"
            onEndEditing={e => onLongChangeText(e.nativeEvent.text)}
          />
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {t`Longitude is invalid`}
          </FormControl.ErrorMessage>
        </FormControl>
      </HStack>
      <HStack>
        <FormControl alignItems="center" justifyContent="center">
          <FormControl.Label>
            <Text fontSize="xs" textAlign="justify">
              {t`You can also paste coords from clipboard`}
            </Text>
          </FormControl.Label>
          <Button
            onPress={onPasteButtonPressed}
            textAlign="center"
            width="1/3">{t`paste`}</Button>
        </FormControl>
      </HStack>
    </ScrollView>
  );
}