import {Qibla, Coordinates} from 'adhan';
import {Flex, HStack, Text, useColorMode, View} from 'native-base';
import {useEffect, useMemo, useState} from 'react';
import {Animated, useWindowDimensions} from 'react-native';
import AccuracyIndicator from './accuracy_indicator';
import {
  useCompassHeading,
  useCompassAccuracy,
  setCompassLocation,
} from '@/modules/compass';
import {calcSettings} from '@/store/calculation';

export function QiblaFinder() {
  const heading = useCompassHeading();
  const accuracy = useCompassAccuracy();
  const {colorMode} = useColorMode();
  const [qiblaDegree, setQiblaDegree] = useState(0);

  const dimensions = useWindowDimensions();

  const [lockedVariableName, unlockedVariableName]: Array<'width' | 'height'> =
    useMemo(() => {
      const isPortrait = dimensions.height > dimensions.width;
      if (isPortrait) {
        return ['width', 'height'];
      } else {
        return ['height', 'width'];
      }
    }, [dimensions.height, dimensions.width]);

  useEffect(() => {
    const {LOCATION_LAT, LOCATION_LONG} = calcSettings.getState();
    if (LOCATION_LAT && LOCATION_LONG) {
      setCompassLocation(LOCATION_LAT, LOCATION_LONG, 1);
      const qibla = Qibla(new Coordinates(LOCATION_LAT, LOCATION_LONG));
      setQiblaDegree(qibla);
    }
  }, []);

  return (
    <Flex safeArea py="2" flexDirection="column">
      <HStack justifyContent="space-between" px="3">
        <AccuracyIndicator accuracy={accuracy} />
      </HStack>
      <Flex
        position="relative"
        justifyContent="center"
        alignItems="center"
        my="5">
        <Animated.Image
          source={
            colorMode === 'dark'
              ? require('@/assets/compass/compass_base_dark.png')
              : require('@/assets/compass/compass_base_light.png')
          }
          style={{
            [lockedVariableName]: dimensions[lockedVariableName],
            [unlockedVariableName]: dimensions[lockedVariableName],
            resizeMode: 'contain',
            transform: [{rotate: -heading + 'deg'}],
          }}
        />
        <View
          position="absolute"
          left={0}
          top={0}
          right={0}
          bottom={0}
          justifyContent="center"
          alignItems="center">
          <Text fontSize="3xl">{Math.round(heading)}&deg;</Text>
        </View>
        <View
          position="absolute"
          left={0}
          top={0}
          right={0}
          bottom={0}
          justifyContent="center"
          alignItems="center">
          <Animated.Image
            source={require('@/assets/compass/qibla_indicator.png')}
            style={{
              [lockedVariableName]: dimensions[lockedVariableName],
              [unlockedVariableName]: dimensions[lockedVariableName],
              resizeMode: 'contain',
              transform: [
                {
                  rotate: -heading + qiblaDegree + 'deg',
                },
              ],
            }}
          />
        </View>
      </Flex>
    </Flex>
  );
}
