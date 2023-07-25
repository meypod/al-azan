import {t} from '@lingui/macro';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Qibla, Coordinates} from 'adhan-extended';
import {
  Stack,
  HStack,
  Input,
  useColorMode,
  View,
  Text,
  Button,
  Spinner,
} from 'native-base';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  useWindowDimensions,
  Image,
  TextInput as NativeTextInput,
  ToastAndroid,
} from 'react-native';
import LocationProvider from 'react-native-get-location';
import {LocationSearchingIcon} from '@/assets/icons/material_icons/location_searching';
import {MyLocationIcon} from '@/assets/icons/material_icons/my_location';
import {SafeArea} from '@/components/safe_area';
import CompassMod, {
  setCompassLocation,
  setUpdateRate,
  useCompassAccuracy,
} from '@/modules/compass';
import {RootStackParamList} from '@/navigation/types';
import AccuracyIndicator from '@/screens/qibla_finder_compass/accuracy_indicator';
import {calcSettings} from '@/store/calculation';

type Props = NativeStackScreenProps<RootStackParamList, 'QiblaCompass'>;

export function QiblaCompass({route}: Props) {
  const accuracy = useCompassAccuracy();
  const {colorMode} = useColorMode();
  const [staticQiblaDegree, setStaticQiblaDegree] = useState(0);
  const qiblaDegree = useRef(0);
  const triedLocationOnce = useRef(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [fetchedCoords, setFetchedCoords] = useState<
    {lat: number; long: number} | undefined
  >(undefined);

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

  const updateQiblaDegree = useCallback(
    ({lat, long}: {lat: number; long: number}) => {
      setCompassLocation(lat, long, 1);
      const qibla = Qibla(new Coordinates(lat, long));
      qiblaDegree.current = qibla;
      setStaticQiblaDegree(Math.round(qiblaDegree.current));
    },
    [],
  );

  const refreshLocation = useCallback(
    async (ignoreError?: boolean) => {
      setGettingLocation(true);
      try {
        const location = await LocationProvider.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        });
        setFetchedCoords({lat: location.latitude, long: location.longitude});
        updateQiblaDegree({lat: location.latitude, long: location.longitude});
        return true;
      } catch {
        if (!ignoreError) {
          ToastAndroid.show(
            t`Error while getting coordinates`,
            ToastAndroid.SHORT,
          );
        }
        return false;
      } finally {
        setGettingLocation(false);
      }
    },
    [updateQiblaDegree],
  );

  const onRefreshLocationPressed = useCallback(() => {
    refreshLocation(false);
  }, [refreshLocation]);

  useEffect(() => {
    if (triedLocationOnce.current) return;
    triedLocationOnce.current = true;
    const {LOCATION} = calcSettings.getState();
    if (LOCATION?.lat && LOCATION.long) {
      setFetchedCoords(undefined);
      updateQiblaDegree({lat: LOCATION.lat, long: LOCATION.long});
    }
    if (route?.params?.skipInit) return;
    ToastAndroid.show(t`Getting coordinates`, ToastAndroid.SHORT);
    refreshLocation(true);
  }, [refreshLocation, route?.params?.skipInit, updateQiblaDegree]);

  const compassImgRef = useRef<Image>(null);
  const qiblaImgRef = useRef<Image>(null);
  const degreeTextRef = useRef<NativeTextInput>(null);

  useEffect(() => {
    setUpdateRate(20);
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
    <SafeArea>
      <Stack py="2" flexDirection="column">
        <HStack justifyContent="space-between" px="3" mb="4">
          <AccuracyIndicator accuracy={accuracy} />
          <Text>
            {t`Qibla`}
            {': '}
            {staticQiblaDegree}
            {'\u00B0 '}
            {t`from North`}
          </Text>
        </HStack>
        <HStack px="3" alignItems="center">
          <Text mr="2">
            {t`Location`}
            {': '}
            {fetchedCoords
              ? fetchedCoords.lat.toFixed(2) +
                ', ' +
                fetchedCoords.long.toFixed(2)
              : t`from settings`}
          </Text>
          <Button
            size="sm"
            p="1"
            variant="outline"
            onPress={onRefreshLocationPressed}
            disabled={gettingLocation}>
            {gettingLocation ? (
              <Spinner accessibilityLabel={t`Getting coordinates`} />
            ) : fetchedCoords ? (
              <MyLocationIcon size="md" />
            ) : (
              <LocationSearchingIcon size="md" />
            )}
          </Button>
        </HStack>
        <Stack
          position="relative"
          justifyContent="center"
          alignItems="center"
          zIndex={-1}
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
        </Stack>
      </Stack>
    </SafeArea>
  );
}
