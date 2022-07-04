import {i18n} from '@lingui/core';
import {Flex, Spacer, Text, useColorMode, HStack} from 'native-base';
import {memo} from 'react';
import {NonPrayer, Prayer, prayerTranslations} from '@/adhan';
import {MutedIcon} from '@/assets/icons/muted';
import {getTime24} from '@/utils/date';

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
  const {colorMode} = useColorMode();
  const isDarkMode = colorMode === 'dark';

  return (
    <Flex
      direction="row"
      width="100%"
      py="2"
      align="center"
      borderColor={active ? 'yellow.300' : 'coolGray.400'}
      borderRadius="md"
      borderWidth="2"
      borderStyle={NonPrayer.includes(prayer) ? 'dotted' : 'solid'}
      marginBottom="3"
      bg={active && !isDarkMode ? 'yellow.100' : null}
      padding="4">
      <HStack alignItems="center">
        <Text>{i18n._(prayerTranslations[prayer.toLowerCase()])}</Text>
        {active && isActiveDismissed && <MutedIcon mx="1"></MutedIcon>}
      </HStack>

      <Spacer />
      {<Text>{date ? getTime24(date) : '--:--'}</Text>}
    </Flex>
  );
}

export default memo(PrayerTimeRow);
