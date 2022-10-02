import {t} from '@lingui/macro';
import {HStack, VStack, Text} from 'native-base';
import {IVStackProps} from 'native-base/lib/typescript/components/primitives/Stack/VStack';

import {Prayer} from '@/adhan';
import {AdjustmentSetting} from '@/screens/settings_calculation/adjustment_setting';

const AdjustablePrayersTop = [Prayer.Fajr, Prayer.Sunrise, Prayer.Dhuhr];

const AdjustablePrayersBottom = [Prayer.Asr, Prayer.Maghrib, Prayer.Isha];

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
      <HStack mb="3">
        {AdjustablePrayersTop.map(prayer => (
          <AdjustmentSetting flex={1} prayer={prayer} key={prayer.toString()} />
        ))}
      </HStack>
      <HStack {...vStackProps}>
        {AdjustablePrayersBottom.map(prayer => (
          <AdjustmentSetting flex={1} prayer={prayer} key={prayer.toString()} />
        ))}
      </HStack>
    </VStack>
  );
}
