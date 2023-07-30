import {t} from '@lingui/macro';
import {Button, HStack, Text, Spinner} from 'native-base';
import {useCallback, useState} from 'react';
import {ToastAndroid} from 'react-native';
import LocationProvider from 'react-native-get-location';
import {LocationDetail} from '@/store/calculation';
import {askForLocationService} from '@/utils/dialogs';

export type GPSButtonProps = {
  onLocated: (location: LocationDetail) => void;
};

export function GPSButton({onLocated}: GPSButtonProps) {
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);

  const getCoordinatesFromLocationProvider = useCallback(async () => {
    if (!(await askForLocationService())) {
      return;
    }
    setGettingLocation(true);
    LocationProvider.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 25000,
    })
      .then(loc => {
        onLocated({
          lat: loc.latitude,
          long: loc.longitude,
        });
        ToastAndroid.show(t`Coordinates updated`, ToastAndroid.SHORT);
      })
      .catch(() => {
        ToastAndroid.show(
          t`Error while getting coordinates`,
          ToastAndroid.SHORT,
        );
      })
      .finally(() => setGettingLocation(false));
  }, [onLocated]);

  return (
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
  );
}
