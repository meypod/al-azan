import {Stack, Spacer, Text, HStack} from 'native-base';
import {memo} from 'react';
import {NonPrayer, Prayer, translatePrayer} from '@/adhan';
import {MutedIcon} from '@/assets/icons/material_icons/muted';
import {getTime} from '@/utils/date';

type TimeRowProps = {
  date?: Date;
  prayer: Prayer;
  active?: boolean;
  isActiveDismissed?: boolean;
};

function PrayerTimeRow({
  date,
  prayer,
  active,
  isActiveDismissed,
}: TimeRowProps) {
  return (
    <Stack
      flexWrap="wrap"
      flexDirection="row"
      width="100%"
      py="2"
      alignItems="center"
      borderColor={active ? 'yellow.300' : 'coolGray.400'}
      borderRadius="md"
      borderWidth="2"
      borderStyle={NonPrayer.includes(prayer) ? 'dotted' : 'solid'}
      marginBottom="3"
      _light={{
        bg: active ? 'yellow.100' : null,
      }}
      padding="4">
      <HStack alignItems="center">
        <Text>{translatePrayer(prayer)}</Text>
        {active && isActiveDismissed && <MutedIcon mx="1"></MutedIcon>}
      </HStack>

      <Spacer />
      {<Text>{date ? getTime(date) : '--:--'}</Text>}
    </Stack>
  );
}

export default memo(PrayerTimeRow);
