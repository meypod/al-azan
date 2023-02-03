import {Box, Text} from 'native-base';
import {useEffect, useRef} from 'react';
import {Animated, Easing} from 'react-native';
import {
  useCompassHeading,
  useCompassAccuracy,
  AccuracyLevel,
} from '@/modules/compass';

export function QiblaFinder() {
  const heading = useCompassHeading();
  const accuracy = useCompassAccuracy();

  const lastHeading = useRef(0);
  const rotationValue = useRef(new Animated.Value(0));

  useEffect(() => {
    const difference = Math.abs(lastHeading.current - heading);
    if (heading > 180 && difference > 180) {
      // dont take a 360, instead do a closest turn
      // by using the minus variant
      lastHeading.current = heading - 360;
    } else {
      lastHeading.current = heading;
    }

    if (!isNaN(lastHeading.current)) {
      Animated.timing(rotationValue.current, {
        toValue: lastHeading.current,
        duration: 300,
        easing: Easing.bezier(0.37, 0, 0.63, 1),
        useNativeDriver: true,
      }).start();
    }
  }, [heading]);

  const rotation = rotationValue.current.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

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
            transform: [{rotate: rotation}],
          }}
        />
      </Box>
    </Box>
  );
}
