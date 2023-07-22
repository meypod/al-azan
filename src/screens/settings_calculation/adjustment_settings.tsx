import {t} from '@lingui/macro';
import {HStack, VStack, Text} from 'native-base';
import {IVStackProps} from 'native-base/lib/typescript/components/primitives/Stack/VStack';

import {Prayer} from '@/adhan';
import {AdjustmentSetting} from '@/screens/settings_calculation/adjustment_setting';

const AdjustablePrayers = [
  [Prayer.Fajr, Prayer.Sunrise, Prayer.Dhuhr, Prayer.Asr],
  [Prayer.Sunset, Prayer.Maghrib, Prayer.Isha, Prayer.Midnight],
];

export function AdjustmentSettings({...vStackProps}: IVStackProps) {
  return (
    <VStack {...vStackProps}>
      <Text fontSize="xs" mb="2">
        {t({
          id: 'adjustment.hint',
          comment: 'shown under adjustment accordion in calculation settings',
          message: `Number of minutes that will be added to the calculated times`,
        })}
      </Text>
      <HStack mb="3">
        <VStack flex="1">
          {AdjustablePrayers[0].map(prayer => (
            <AdjustmentSetting
              flex={1}
              prayer={prayer}
              key={prayer.toString()}
            />
          ))}
        </VStack>
        <VStack flex="1" pl="3">
          {AdjustablePrayers[1].map(prayer => (
            <AdjustmentSetting
              flex={1}
              prayer={prayer}
              key={prayer.toString()}
            />
          ))}
        </VStack>
      </HStack>

      <Text fontSize="xs" mb="2">
        {t({
          id: 'hijri.adjustment.hint',
          comment: 'shown under adjustment accordion in calculation settings',
          message: `Number of days that will be added to the lunar calendar`,
        })}
      </Text>
      <AdjustmentSetting
        flex={1}
        settingKey={'HIJRI_DATE_ADJUSTMENT'}
        label={''}
      />
    </VStack>
  );
}
