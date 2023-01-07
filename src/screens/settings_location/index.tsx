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
  Spacer,
} from 'native-base';
import {useCallback, useLayoutEffect, useState} from 'react';
import {ToastAndroid} from 'react-native';
import LocationProvider from 'react-native-get-location';
import {AutocompleteInput} from '@/components/AutocompleteInput';
import Divider from '@/components/Divider';
import {useCalcSettingsHelper} from '@/store/calculation';
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

const clipboardCoordsRegex = /\s*([-\d.]+)[\s°NS]*[,| ]{1}\s*([-\d.]+)[\s°EW]*/;

export function LocationSettings(props: IScrollViewProps) {
  const [lat, setLat] = useCalcSettingsHelper('LOCATION_LAT');
  const [long, setLong] = useCalcSettingsHelper('LOCATION_LONG');
  const [tempLat, setTempLat] = useState<string>('-');
  const [tempLong, setTempLong] = useState<string>('-');
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
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

  const clearCoordinates = () => {
    setLat(undefined);
    setLong(undefined);
    clearCountryAndCity();
  };

  const getCoordinatesFromLocationProvider = () => {
    setGettingLocation(true);
    LocationProvider.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then(location => {
        setLat(location.latitude);
        setLong(location.longitude);
        clearCountryAndCity();
        ToastAndroid.show(t`Coordinates updated`, ToastAndroid.SHORT);
      })
      .catch(() => {
        ToastAndroid.show(
          t`Error while getting coordinates`,
          ToastAndroid.SHORT,
        );
      })
      .finally(() => setGettingLocation(false));
  };

  return (
    <ScrollView
      p="4"
      _contentContainerStyle={{paddingBottom: 40}}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      {...props}>
      <Text textAlign="justify">{t`To calculate Adhan, We need your location. You can use the "Find My Location" button, or use the country and city/area search, or enter your coordinates manually.`}</Text>

      <Divider label={t`Using GPS`} mb="3" mt="2" />

      <Button
        onPress={getCoordinatesFromLocationProvider}
        disabled={gettingLocation}>
        <HStack alignItems="center">
          <Text
            adjustsFontSizeToFit
            _light={{color: 'white'}}>{t`Find My Location`}</Text>
          {gettingLocation && (
            <Spinner
              mx="2"
              accessibilityLabel={t`Getting coordinates`}
              color="lime.200"
            />
          )}
        </HStack>
      </Button>

      <Divider label={t`Using Search`} mt="4" />

      <HStack display="flex" flexGrow={0}>
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

      <Divider label={t`Using Coordinates`} mb="2" mt="4" />

      <HStack>
        <FormControl flex={1} flexGrow={1} pr="1" mb="1">
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
        <FormControl flex={1} flexGrow={1} pl="1">
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

        {(lat || long) && (
          <FormControl flexShrink={1} flexGrow={0} width="10" pl="1">
            <FormControl.Label> </FormControl.Label>
            <Button
              borderColor="danger.900"
              variant="outline"
              colorScheme="danger"
              size="sm"
              onPress={clearCoordinates}>
              <CloseIcon />
            </Button>
          </FormControl>
        )}
      </HStack>
      <HStack mt="5">
        <FormControl alignItems="center" justifyContent="center">
          <FormControl.Label mb="3">
            <Text fontSize="sm" textAlign="justify">
              {t`You can also paste coords from clipboard`}
            </Text>
          </FormControl.Label>
          <Button
            onPress={onPasteButtonPressed}
            textAlign="center"
            width="1/3">{t`Paste`}</Button>
          <Spacer />
        </FormControl>
      </HStack>
    </ScrollView>
  );
}
