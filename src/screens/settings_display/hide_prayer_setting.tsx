import {t} from '@lingui/macro';
import {Checkbox, HStack, IStackProps, Stack, Text} from 'native-base';
import {memo} from 'react';
import {Prayer, translatePrayer} from '@/adhan';

function HidePrayerSetting({prayer, ...props}: IStackProps & {prayer: Prayer}) {
  const prayerName = translatePrayer(prayer);
  return (
    <HStack {...props} justifyContent="space-between">
      <Text width="1/2">{prayerName}</Text>

      <Stack width="1/2" justifyContent="center" alignItems="center">
        <Checkbox
          value={prayer}
          size="md"
          accessibilityLabel={t`should ${prayerName} be hidden?`}
        />
      </Stack>
    </HStack>
  );
}

export default memo(HidePrayerSetting);
