import {t} from '@lingui/macro';
import MapLibreGL from '@maplibre/maplibre-react-native';
import {Button, HStack, Text, ScrollView, Spacer} from 'native-base';
import {useCallback} from 'react';
import {Alert} from 'react-native';
import {SafeArea} from '@/components/safe_area';
import {
  isNetworkAvailable,
  openMobileDataSettings,
  openMobileWifiSettings,
} from '@/modules/activity';
import {navigate} from '@/navigation/root_navigation';
import {useSettings} from '@/store/settings';
import {askForLocationService} from '@/utils/dialogs';

export function QiblaFinder() {
  const [understood, setUnderstood] = useSettings('QIBLA_FINDER_UNDERSTOOD');

  const onUnderstood = useCallback(() => {
    setUnderstood(true);
  }, [setUnderstood]);

  const askForGps = useCallback(async () => {
    await askForLocationService(
      t`Qibla finder needs location service. If not enabled, location from app settings will be used.`,
    );
  }, []);

  const navigateToQiblaMap = useCallback(async () => {
    if (!MapLibreGL) {
      Alert.alert(
        t`Info`,
        t`Qibla map is currently unavailable in F-Droid builds. It may become available in future updates.`,
        [
          {
            text: t`Okay`,
            style: 'cancel',
          },
        ],
      );
      return;
    }

    const networkAvailable = await isNetworkAvailable();

    if (!networkAvailable) {
      const networkResult = await new Promise(resolve => {
        Alert.alert(
          t`Internet connection`,
          t`Internet connection is necessary for qibla map to work. Please enable your wifi or mobile data and try again.`,
          [
            {
              text: t`Okay`,
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: t`Mobile Data`,
              onPress: () => {
                openMobileDataSettings().then(resolve);
              },
              style: 'default',
            },
            {
              text: t`Wifi`,
              onPress: () => {
                openMobileWifiSettings().then(resolve);
              },
              style: 'default',
            },
          ],
        );
      });
      if (!networkResult) return;
    }
    await askForGps();
    navigate('QiblaMap');
  }, [askForGps]);

  const navigateToQiblaCompass = useCallback(async () => {
    await askForGps();
    navigate('QiblaCompass');
  }, [askForGps]);

  return (
    <SafeArea>
      <ScrollView p="3">
        <Text textAlign="center" fontSize="xl">
          {t`Disclaimer`}
        </Text>
        <Text mb="8" textAlign="justify">
          {t`Note that due to software and hardware errors, Qibla direction shown by this app, particularly in compass mode, can be wrong.`}{' '}
          {t`Other magnetic devices may interfere with your phone's compass and your compass may need calibration.`}
        </Text>
        {understood ? (
          <HStack justifyContent="space-between" flexWrap="wrap" px="3">
            <Button
              onPress={navigateToQiblaMap}
              mr="2"
              mb="2">{t`Use Map`}</Button>
            <Button
              onPress={navigateToQiblaCompass}
              mb="2">{t`Use Compass`}</Button>
          </HStack>
        ) : (
          <Button onPress={onUnderstood}>{t`I Understand`}</Button>
        )}
        <Spacer mb="8" />
      </ScrollView>
    </SafeArea>
  );
}
