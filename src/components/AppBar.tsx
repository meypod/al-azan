import {HStack, StatusBar, Button, Text} from 'native-base';
import {SettingsSharpIcon} from '@/assets/icons/settings_sharp';
import {navigate} from '@/navigation/root_navigation';

type AppBarProps = {
  dayName?: string;
  dd?: string;
  monthName?: string;
};

export function AppBar({dayName, monthName, dd}: AppBarProps = {}) {
  const settingsPressed = () => {
    navigate('Settings');
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <HStack
        px="3"
        justifyContent="space-between"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="coolGray.300"
        w="100%">
        <HStack alignItems="center">
          <Text>
            {monthName}, {dd}
          </Text>
        </HStack>
        <HStack
          left="0"
          right="0"
          alignItems="center"
          justifyContent="center"
          position="absolute">
          <Text>{dayName}</Text>
        </HStack>

        <Button marginRight="-3" variant="ghost" onPress={settingsPressed}>
          <SettingsSharpIcon size="lg" />
        </Button>
      </HStack>
    </>
  );
}
