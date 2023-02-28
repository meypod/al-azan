import {t} from '@lingui/macro';
import {Qibla, Coordinates} from 'adhan';
import {Flex, HStack, Input, useColorMode, View, Text} from 'native-base';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  useWindowDimensions,
  Image,
  TextInput as NativeTextInput,
} from 'react-native';
import CompassMod, {
  setCompassLocation,
  setUpdateRate,
  useCompassAccuracy,
} from '@/modules/compass';
import AccuracyIndicator from '@/screens/qibla_finder/accuracy_indicator';
import {calcSettings} from '@/store/calculation';

export function QiblaCompass() {
  const accuracy = useCompassAccuracy();
  const {colorMode} = useColorMode();
  const [staticQiblaDegree, setStaticQiblaDegree] = useState(0);
  const qiblaDegree = useRef(0);

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
      qiblaDegree.current = qibla;
      setStaticQiblaDegree(Math.round(qiblaDegree.current));
    }
    setUpdateRate(20);
  }, []);

  const compassImgRef = useRef<Image>(null);
  const qiblaImgRef = useRef<Image>(null);
  const degreeTextRef = useRef<NativeTextInput>(null);

  useEffect(() => {
    const sub = CompassMod.addListener('heading', degrees => {
      compassImgRef.current?.setNativeProps({
        transform: [
          {
            rotate: -degrees + 'deg',
          },
        ],
      });
      qiblaImgRef.current?.setNativeProps({
        transform: [
          {
            rotate: -degrees + qiblaDegree.current + 'deg',
          },
        ],
      });
      degreeTextRef.current?.setNativeProps({
        text: Math.round(degrees) + '\u00B0', // deg symbol
      });
    });
    return () => sub.remove();
  }, []);

  return (
    <Flex safeArea py="2" flexDirection="column">
      <HStack justifyContent="space-between" px="3">
        <AccuracyIndicator accuracy={accuracy} />
        <Text>
          {t`Qibla`}
          {': '}
          {staticQiblaDegree}
          {'\u00B0 '}
          {t`from North`}
        </Text>
      </HStack>
      <Flex
        position="relative"
        justifyContent="center"
        alignItems="center"
        my="5">
        <Image
          ref={compassImgRef}
          source={
            colorMode === 'dark'
              ? require('@/assets/compass/compass_base_dark.png')
              : require('@/assets/compass/compass_base_light.png')
          }
          style={{
            [lockedVariableName]: dimensions[lockedVariableName],
            [unlockedVariableName]: dimensions[lockedVariableName],
            resizeMode: 'contain',
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
          <Input
            fontSize="3xl"
            ref={degreeTextRef}
            defaultValue="0&deg;"
            borderWidth={0}
            textAlign="center"
            caretHidden={true}
            isReadOnly={true}
          />
        </View>
        <View
          position="absolute"
          left={0}
          top={0}
          right={0}
          bottom={0}
          justifyContent="center"
          alignItems="center">
          <Image
            ref={qiblaImgRef}
            source={require('@/assets/compass/qibla_indicator.png')}
            style={{
              [lockedVariableName]: dimensions[lockedVariableName],
              [unlockedVariableName]: dimensions[lockedVariableName],
              resizeMode: 'contain',
            }}
          />
        </View>
      </Flex>
    </Flex>
  );
}
