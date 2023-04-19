import {t} from '@lingui/macro';
import {HStack, VStack, Text} from 'native-base';
import {IVStackProps} from 'native-base/lib/typescript/components/primitives/Stack/VStack';

import {Prayer} from '@/adhan';
import {AdjustmentSetting} from '@/screens/settings_calculation/adjustment_setting';

const AdjustablePrayers = [
  [Prayer.Fajr, Prayer.Sunrise, Prayer.Dhuhr, Prayer.Asr],
  [Prayer.Sunset, Prayer.Maghrib, Prayer.Isha],
];

export function AdjustmentSettings({...vStackProps}: IVStackProps) {
  return (
    <VStack {...vStackProps}>
      <Text textAlign="justify" fontSize="xs" mb="2">
        {t({
          id: 'adjustment.hint',
          comment: 'shown under adjustment accordion in calculation settings',
          message: `Number of minutes that will be added to the calculated times`,
        })}
      </Text>
      <HStack>
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
    </VStack>
  );
}
