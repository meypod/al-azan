import {t} from '@lingui/macro';
import {
  Checkbox,
  HStack,
  IStackProps,
  Pressable,
  Stack,
  Text,
} from 'native-base';
import {memo} from 'react';
import {Prayer, translatePrayer} from '@/adhan';

function HidePrayerSetting({
  prayer,
  onToggle,
  ...props
}: IStackProps & {prayer: Prayer; onToggle: (prayer: Prayer) => void}) {
  const prayerName = translatePrayer(prayer);
  const toggle = () => onToggle(prayer);

  return (
    <Pressable onPress={toggle}>
      <HStack {...props} justifyContent="space-between">
        <Text width="1/2">{prayerName}</Text>

        <Stack
          width="1/2"
          justifyContent="center"
          alignItems="center"
          pointerEvents="none">
          <Checkbox
            value={prayer}
            size="md"
            accessibilityLabel={t`should ${prayerName} be hidden?`}
          />
        </Stack>
      </HStack>
    </Pressable>
  );
}

export default memo(HidePrayerSetting);
