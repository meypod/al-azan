import {Flex, Spacer, Text, useTheme, useColorMode, HStack} from 'native-base';
import {MutedIcon} from '@/assets/icons/muted';
import {isRTL} from '@/i18n';
import {getTime24} from '@/utils/date';

type TimeRowProps = {
  date?: Date;
  title: string;
  active?: boolean;
  isActiveDismissed?: boolean;
};

export function PrayerTimeRow({
  date,
  title,
  active,
  isActiveDismissed,
}: TimeRowProps) {
  const {colors} = useTheme();
  const {colorMode} = useColorMode();
  const isDarkMode = colorMode === 'dark';

  return (
    <Flex
      direction={isRTL ? 'row-reverse' : 'row'}
      width="100%"
      py="2"
      align="center"
      borderColor={active ? colors.yellow[400] : colors.coolGray[400]}
      borderRadius="md"
      borderWidth="2"
      marginBottom="3"
      bg={active && !isDarkMode ? colors.yellow[100] : null}
      padding="4">
      <HStack alignItems="center">
        <Text>{title}</Text>
        {active && isActiveDismissed && <MutedIcon mx="1"></MutedIcon>}
      </HStack>

      <Spacer />
      {<Text>{date ? getTime24(date) : '--:--'}</Text>}
    </Flex>
  );
}
