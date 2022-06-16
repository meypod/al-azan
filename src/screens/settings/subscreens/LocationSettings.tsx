import {t} from '@lingui/macro';
import Clipboard from '@react-native-clipboard/clipboard';
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
import {useCallback, useLayoutEffect, useState} from 'react';
import {ToastAndroid} from 'react-native';
import {AutocompleteInput} from '@/components/AutocompleteInput';
import {isRTL} from '@/i18n';
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

export function LocationSettings(props: IStackProps) {
  const [lat, setLat] = useSettingsHelper('LOCATION_LAT');
  const [long, setLong] = useSettingsHelper('LOCATION_LONG');
  const [tempLat, setTempLat] = useState<string>('-');
  const [tempLong, setTempLong] = useState<string>('-');
  const [selectedCountry, setSelectedCountry] =
    useSettingsHelper('LOCATION_COUNTRY');

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
    <VStack p="4" {...props}>
      <HStack display="flex" flexGrow={0}>
        <FormControl
          display="flex"
          width={selectedCountry ? undefined : '100%'}
          isInvalid={!!getCountryError}>
          <FormControl.Label
            flexDirection={
              isRTL ? 'row-reverse' : 'row'
            }>{t`Country`}</FormControl.Label>
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
          <FormControl.ErrorMessage
            flexDirection={isRTL ? 'row-reverse' : 'row'}
            leftIcon={<WarningOutlineIcon size="xs" />}>
            {t`Error in loading countries`}
          </FormControl.ErrorMessage>
        </FormControl>

        {selectedCountry && (
          <FormControl
            ml="3%"
            width={selectedCity ? undefined : '66%'}
            flexGrow={1}
            isInvalid={!!searchCitiesError}>
            <FormControl.Label
              flexDirection={
                isRTL ? 'row-reverse' : 'row'
              }>{t`City/Area`}</FormControl.Label>
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
              flexDirection={isRTL ? 'row-reverse' : 'row'}
              leftIcon={<WarningOutlineIcon size="xs" />}>
              {t`Error in loading search results`}
            </FormControl.ErrorMessage>
          </FormControl>
        )}
        <Box pb="2" justifyContent="flex-end">
          {(selectedCountry || selectedCity) && (
            <Button
              height={8}
              width={8}
              variant="ghost"
              onPress={clearCountryAndCity}>
              <CloseIcon />
            </Button>
          )}
        </Box>
      </HStack>

      <HStack>
        <FormControl width="1/2" pr="1">
          <FormControl.Label
            flexDirection={
              isRTL ? 'row-reverse' : 'row'
            }>{t`Latitude`}</FormControl.Label>
          <Input
            py="0"
            placeholder={t`Latitude`}
            value={tempLat?.toString()}
            keyboardType="number-pad"
            onChangeText={str => setTempLat(str)}
            onEndEditing={e => onLatChangeText(e.nativeEvent.text)}
          />
          <FormControl.ErrorMessage
            flexDirection={isRTL ? 'row-reverse' : 'row'}
            leftIcon={<WarningOutlineIcon size="xs" />}>
            {t`Latitude is invalid`}
          </FormControl.ErrorMessage>
        </FormControl>
        <FormControl width="1/2" pl="1">
          <FormControl.Label
            flexDirection={
              isRTL ? 'row-reverse' : 'row'
            }>{t`Longitude`}</FormControl.Label>
          <Input
            py="0"
            placeholder={t`Longitude`}
            value={tempLong?.toString()}
            onChangeText={str => setTempLong(str)}
            keyboardType="number-pad"
            onEndEditing={e => onLongChangeText(e.nativeEvent.text)}
          />
          <FormControl.ErrorMessage
            flexDirection={isRTL ? 'row-reverse' : 'row'}
            leftIcon={<WarningOutlineIcon size="xs" />}>
            {t`Longitude is invalid`}
          </FormControl.ErrorMessage>
        </FormControl>
      </HStack>
      <HStack>
        <FormControl alignItems="center" justifyContent="center">
          <FormControl.Label>
            {t`You can also paste coords from clipboard`}
          </FormControl.Label>
          <Button
            onPress={onPasteButtonPressed}
            textAlign="center"
            width="1/3">{t`paste`}</Button>
        </FormControl>
      </HStack>
    </VStack>
  );
}
