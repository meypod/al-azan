import {t} from '@lingui/macro';
import notifee from '@notifee/react-native';
import {
  FormControl,
  IStackProps,
  Text,
  VStack,
  HStack,
  Button,
} from 'native-base';
import {useEffect, useState} from 'react';
import {isRTL} from '@/i18n';
import useInterval from '@/utils/hooks/use_interval';

export function BatteryOptimizationSettings(props: IStackProps) {
  const [batteryOptimizationStatus, setBatteryOptimizationStatus] =
    useState<Boolean>(false);
  const [powerManagerInfo, setPowerManagerInfo] = useState<
    Awaited<ReturnType<typeof notifee.getPowerManagerInfo>> | undefined
  >(undefined);

  const checkStatus = () =>
    notifee
      .isBatteryOptimizationEnabled()
      .then(isEnabled => setBatteryOptimizationStatus(isEnabled))
      .catch(() => {});

  useInterval(() => {
    checkStatus();
  }, 1000);

  useEffect(() => {
    notifee
      .getPowerManagerInfo()
      .then(info => setPowerManagerInfo(info))
      .catch(() => {});
  });

  return (
    <VStack p="4" {...props}>
      <FormControl display="flex" pb="8">
        <FormControl.Label
          flexDirection={
            isRTL ? 'row-reverse' : 'row'
          }>{t`Battery Optimization`}</FormControl.Label>
        <FormControl.HelperText>
          <Text textAlign={isRTL ? 'right' : 'left'} fontSize="xs">
            {t`Depending on your device and android version, Sometimes your device may kill the app in the background to save battery. This can prevent alarms/notifications from being delivered.`}
          </Text>
          <Text textAlign={isRTL ? 'right' : 'left'} fontSize="xs">
            {t`If you want to make sure the app can work reliably, You have to disable power optimization for this app. You can open related settings using the button below.`}
          </Text>
          <HStack alignSelf="center">
            <Text>{t`Status`}: </Text>
            <Text color={batteryOptimizationStatus ? 'red.400' : 'green.400'}>
              {batteryOptimizationStatus ? t`Enabled` : t`Disabled`}
            </Text>
          </HStack>
        </FormControl.HelperText>

        <Button
          onPress={async () =>
            await notifee.openBatteryOptimizationSettings()
          }>{t`Open Battery Optimization Settings`}</Button>
      </FormControl>

      {powerManagerInfo?.activity && (
        <FormControl display="flex">
          <FormControl.Label
            flexDirection={
              isRTL ? 'row-reverse' : 'row'
            }>{t`Power Manager`}</FormControl.Label>
          <FormControl.HelperText>
            <Text
              textAlign={
                isRTL ? 'right' : 'left'
              }>{t`Some devices need extra settings inside their Power Manager 
          to prevent the app from getting killed in the background.
          In that case disable any power saving option for the app.`}</Text>
            <Text
              textAlign={
                isRTL ? 'right' : 'left'
              }>{t`You can access your device Power Manager using the button below.`}</Text>

            {powerManagerInfo?.activity &&
              powerManagerInfo.manufacturer?.toLowerCase() === 'samsung' && (
                <Text
                  textAlign={isRTL ? 'right' : 'left'}
                  py="3"
                  fontSize="xs">{t`Samsung devices have their own custom Power Manager called "Device Care".
          After pressing the button below, You will be navigated to the Battery menu of Device Care.
          In the Battery menu tap "App power management", and then tap "Apps that won't be put to sleep",
          and add this app to the list.`}</Text>
              )}
          </FormControl.HelperText>

          <Button
            onPress={async () =>
              await notifee.openPowerManagerSettings()
            }>{t`Open Power Manager Settings`}</Button>
        </FormControl>
      )}
    </VStack>
  );
}