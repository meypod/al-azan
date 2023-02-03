import {Box, Text} from 'native-base';
import {useEffect} from 'react';
import {Animated} from 'react-native';
import {
  useCompassHeading,
  useCompassAccuracy,
  AccuracyLevel,
  setCompassLocation,
} from '@/modules/compass';
import {calcSettings} from '@/store/calculation';

export function QiblaFinder() {
  const heading = useCompassHeading();
  const accuracy = useCompassAccuracy();

  useEffect(() => {
    const {LOCATION_LAT, LOCATION_LONG} = calcSettings.getState();
    if (LOCATION_LAT && LOCATION_LONG) {
      setCompassLocation(LOCATION_LAT, LOCATION_LONG, 1);
    }
  }, []);

  return (
    <Box safeArea py="3">
      <Text>
        Accuracy:{' '}
        {accuracy === AccuracyLevel.SENSOR_STATUS_NO_CONTACT
          ? 'Sensor unavailable'
          : accuracy}
      </Text>
      <Text>Degrees: {heading}</Text>
      <Box alignItems="center">
        <Animated.Image
          source={require('@/assets/compass/compass_base.png')}
          style={{
            width: '100%',
            resizeMode: 'contain',
            maxWidth: 512,
            maxHeight: 512,
            transform: [{rotate: -heading + 'deg'}],
          }}
        />
      </Box>
    </Box>
  );
}
