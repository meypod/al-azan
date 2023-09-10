import {t} from '@lingui/macro';
import {CalculationParameters} from 'adhan-extended';
import {HStack, VStack, Text, Stack, Pressable, Button} from 'native-base';
import {useCallback, useMemo, useState} from 'react';
import {Modal, TouchableWithoutFeedback} from 'react-native';
import {useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import {AdjustmentSetting} from './adjustment_setting';
import {CalculationMethods} from '@/adhan';
import {CloseIcon} from '@/assets/icons/material_icons/close';
import {calcSettings} from '@/store/calculation';

export function CalcParamsBox() {
  const {
    CALCULATION_METHOD_KEY,
    FAJR_ANGLE_OVERRIDE,
    ISHA_ANGLE_OVERRIDE,
    ISHA_INTERVAL_OVERRIDE,
    MAGHRIB_ANGLE_OVERRIDE,
  } = useStore(
    calcSettings,
    s => ({
      CALCULATION_METHOD_KEY: s.CALCULATION_METHOD_KEY,
      FAJR_ANGLE_OVERRIDE: s.FAJR_ANGLE_OVERRIDE,
      ISHA_ANGLE_OVERRIDE: s.ISHA_ANGLE_OVERRIDE,
      MAGHRIB_ANGLE_OVERRIDE: s.MAGHRIB_ANGLE_OVERRIDE,
      ISHA_INTERVAL_OVERRIDE: s.ISHA_INTERVAL_OVERRIDE,
    }),
    shallow,
  );

  const calculationParameters = useMemo(() => {
    if (CALCULATION_METHOD_KEY) {
      return CalculationMethods[CALCULATION_METHOD_KEY].get();
    } else {
      return new CalculationParameters('Other', 0, 0);
    }
  }, [CALCULATION_METHOD_KEY]);

  const [editing, setEditing] = useState(false);

  const toggleEditing = useCallback(() => setEditing(e => !e), []);

  return (
    <Stack flex={1}>
      <Pressable onPress={toggleEditing}>
        <HStack
          flex={1}
          borderWidth={1}
          borderRadius={5}
          mt="1"
          py="1"
          borderColor="muted.300"
          _dark={{
            borderColor: 'muted.700',
          }}>
          <VStack flex={1}>
            <Text fontSize="xs" textAlign="center" mb="1">
              {t`Fajr Angle`}
            </Text>
            <Text
              fontSize="sm"
              textAlign="center"
              textDecorationLine="underline">
              {typeof FAJR_ANGLE_OVERRIDE !== 'undefined'
                ? FAJR_ANGLE_OVERRIDE
                : calculationParameters.fajrAngle}
            </Text>
          </VStack>
          <VStack flex={1}>
            <Text fontSize="xs" textAlign="center" mb="1">
              {t`Isha Angle`}
            </Text>
            <Text
              fontSize="sm"
              textAlign="center"
              textDecorationLine="underline">
              {typeof ISHA_ANGLE_OVERRIDE !== 'undefined'
                ? ISHA_ANGLE_OVERRIDE
                : calculationParameters.ishaAngle}
            </Text>
          </VStack>
          <VStack flex={1}>
            <Text fontSize="xs" textAlign="center" mb="1">
              {t`Isha Interval`}
            </Text>
            <Text
              fontSize="sm"
              textAlign="center"
              textDecorationLine="underline">
              {typeof ISHA_INTERVAL_OVERRIDE !== 'undefined'
                ? ISHA_INTERVAL_OVERRIDE
                : calculationParameters.ishaInterval}
            </Text>
          </VStack>
          <VStack flex={1}>
            <Text fontSize="xs" textAlign="center" mb="1">
              {t`Maghrib Angle`}
            </Text>
            <Text
              fontSize="sm"
              textAlign="center"
              textDecorationLine="underline">
              {typeof MAGHRIB_ANGLE_OVERRIDE !== 'undefined'
                ? MAGHRIB_ANGLE_OVERRIDE
                : calculationParameters.maghribAngle}
            </Text>
          </VStack>
        </HStack>
      </Pressable>
      <Modal
        animationType="fade"
        transparent={true}
        visible={editing}
        onRequestClose={toggleEditing}>
        <Pressable
          onPressOut={toggleEditing}
          bg="black:alpha.40"
          flex={1}
          justifyContent="center">
          <TouchableWithoutFeedback>
            <Stack
              m="4"
              rounded="lg"
              _dark={{
                bg: 'coolGray.800',
              }}
              _light={{
                bg: 'coolGray.100',
              }}>
              <HStack
                borderBottomWidth={1}
                _dark={{
                  borderBottomColor: 'coolGray.300:alpha.20',
                }}
                _light={{
                  borderBottomColor: 'coolGray.300',
                }}>
                <Stack px="3" flexDirection="row" alignItems="center" flex={1}>
                  <Text>{t`Edit Calculation Parameters`}</Text>
                </Stack>
                <Button
                  onPress={toggleEditing}
                  variant="ghost"
                  accessibilityLabel={t`Close`}>
                  <CloseIcon size="xl" />
                </Button>
              </HStack>
              <Stack p="3">
                <HStack>
                  <AdjustmentSetting
                    int={false}
                    settingKey={'FAJR_ANGLE_OVERRIDE'}
                    label={t`Fajr Angle`}
                    fallbackInitial={calculationParameters.fajrAngle}
                  />
                  <AdjustmentSetting
                    ml="2"
                    int={false}
                    settingKey={'ISHA_ANGLE_OVERRIDE'}
                    label={t`Isha Angle`}
                    fallbackInitial={calculationParameters.ishaAngle}
                  />
                </HStack>
                <HStack>
                  <AdjustmentSetting
                    settingKey={'ISHA_INTERVAL_OVERRIDE'}
                    label={t`Isha Interval`}
                    fallbackInitial={calculationParameters.ishaInterval}
                  />
                  <AdjustmentSetting
                    ml="2"
                    int={false}
                    settingKey={'MAGHRIB_ANGLE_OVERRIDE'}
                    label={t`Maghrib Angle`}
                    fallbackInitial={calculationParameters.maghribAngle}
                  />
                </HStack>
              </Stack>
            </Stack>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>
    </Stack>
  );
}
