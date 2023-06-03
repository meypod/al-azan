import {t} from '@lingui/macro';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  HStack,
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
import {useCallback, useMemo, useState} from 'react';
import {ToastAndroid} from 'react-native';
import LocationProvider from 'react-native-get-location';
import {AutocompleteInput} from '@/components/AutocompleteInput';
import Divider from '@/components/Divider';
import NumericInput from '@/components/numeric_input';
import {useCalcSettings} from '@/store/calculation';
import {useSettings} from '@/store/settings';
import {askForLocationService} from '@/utils/dialogs';
import {CountryInfo, getCountries, getCities, CityInfo} from '@/utils/geonames';

function isValidCoords(num: number) {
  return num >= -180 && num <= 180;
}

const clipboardCoordsRegex = /\s*([-\d.]+)[\s°NS]*[,| ]{1}\s*([-\d.]+)[\s°EW]*/;

export function LocationSettings(props: IScrollViewProps) {
  const [lat, setLat] = useCalcSettings('LOCATION_LAT');
  const [long, setLong] = useCalcSettings('LOCATION_LONG');
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useSettings('LOCATION_COUNTRY');

  const [selectedCity, setSelectedCity] = useSettings('LOCATION_CITY');

  const clearCountryAndCity = useCallback(() => {
    setSelectedCountry(undefined);
    setSelectedCity(undefined);
  }, [setSelectedCity, setSelectedCountry]);

  const onLatChange = useCallback(
    (num: number | undefined) => {
      setLat(num);
      clearCountryAndCity();
    },
    [clearCountryAndCity, setLat],
  );

  const onLongChange = useCallback(
    (num: number | undefined) => {
      setLong(num);
      clearCountryAndCity();
    },
    [clearCountryAndCity, setLong],
  );

  const onPasteButtonPressed = useCallback(() => {
    Clipboard.getString()
      .then(str => {
        const match = str.match(clipboardCoordsRegex);
        if (match && match.length === 3) {
          const parsedLat = parseFloat(match[1]);
          const parsedLong = parseFloat(match[2]);
          if (
            !isNaN(parsedLat) &&
            !isNaN(parsedLong) &&
            isValidCoords(parsedLat) &&
            isValidCoords(parsedLong)
          ) {
            onLatChange(parsedLat);
            onLongChange(parsedLong);
          }
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
  }, [onLatChange, onLongChange]);

  const getCoordinatesFromLocationProvider = useCallback(async () => {
    if (!(await askForLocationService())) {
      return;
    }
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
  }, [clearCountryAndCity, setLat, setLong]);

  const clearCoordinates = useCallback(() => {
    setLat(undefined);
    setLong(undefined);
  }, [setLat, setLong]);

  const clearCoordinatesAndCities = useCallback(() => {
    clearCoordinates();
    clearCountryAndCity();
  }, [clearCountryAndCity, clearCoordinates]);

  const onCountrySelected = useCallback(
    (country: CountryInfo) => {
      setSelectedCountry(country);
      setSelectedCity(undefined);
      clearCoordinates();
    },
    [clearCoordinates, setSelectedCity, setSelectedCountry],
  );

  const onCitySelected = useCallback(
    (result: CityInfo) => {
      setSelectedCity(result);
      setLong(parseFloat(result.lng));
      setLat(parseFloat(result.lat));
    },
    [setSelectedCity, setLong, setLat],
  );

  const getCitiesData = useMemo(() => {
    if (!selectedCountry) return () => Promise.resolve([]);
    return () => getCities(selectedCountry?.code);
  }, [selectedCountry]);

  return (
    <ScrollView p="4" _contentContainerStyle={{paddingBottom: 40}} {...props}>
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

      <HStack>
        <FormControl width={selectedCountry ? '35%' : '100%'}>
          <FormControl.Label>{t`Country`}</FormControl.Label>
          <AutocompleteInput<CountryInfo>
            actionsheetLabel={t`Country`}
            getData={getCountries}
            onItemSelected={onCountrySelected}
            getOptionLabel={item => (item as any).selectedName || item.name}
            getOptionKey={item => item.code}
            autoCompleteKeys={['names']}
            selectedItem={selectedCountry}
            useReturnedMatch={true}
            size="sm"
            px="1"
            errorMessage={t`Error in loading countries`}
          />
        </FormControl>

        {selectedCountry && (
          <FormControl ml="2" width={selectedCity ? '40%' : '60%'}>
            <FormControl.Label>{t`City/Area`}</FormControl.Label>
            <AutocompleteInput<CityInfo>
              actionsheetLabel={t`City/Area`}
              getData={getCitiesData}
              onItemSelected={onCitySelected}
              getOptionKey={item => item.names}
              getOptionLabel={item => (item as any).selectedName || item.name}
              autoCompleteKeys={['names']}
              useReturnedMatch={true}
              selectedItem={selectedCity}
              size="sm"
              px="1"
            />
            <FormControl.ErrorMessage
              leftIcon={<WarningOutlineIcon size="xs" />}>
              {t`Error in loading search results`}
            </FormControl.ErrorMessage>
          </FormControl>
        )}

        {(selectedCountry || selectedCity) && (
          <FormControl ml="3" justifyContent="center">
            <FormControl.Label> </FormControl.Label>
            <Button
              borderColor="danger.900"
              variant="outline"
              colorScheme="danger"
              width="10"
              height="10"
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
          <NumericInput
            py="0"
            fontSize="lg"
            textAlign="center"
            placeholder={t`Latitude`}
            value={lat}
            onChange={onLatChange}
            invalidLabel="-"
            invalidValue={undefined}
          />
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {t`Latitude is invalid`}
          </FormControl.ErrorMessage>
        </FormControl>
        <FormControl flex={1} flexGrow={1} pl="1">
          <FormControl.Label justifyContent="center">{t`Longitude`}</FormControl.Label>
          <NumericInput
            py="0"
            fontSize="lg"
            textAlign="center"
            placeholder={t`Longitude`}
            value={long}
            onChange={onLongChange}
            invalidLabel="-"
            invalidValue={undefined}
          />
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {t`Longitude is invalid`}
          </FormControl.ErrorMessage>
        </FormControl>

        {lat || long ? (
          <FormControl flexShrink={1} flexGrow={0} width="10" pl="1">
            <FormControl.Label> </FormControl.Label>
            <Button
              borderColor="danger.900"
              variant="outline"
              colorScheme="danger"
              size="sm"
              onPress={clearCoordinatesAndCities}>
              <CloseIcon />
            </Button>
          </FormControl>
        ) : undefined}
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
