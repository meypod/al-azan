import {HStack, StatusBar, Button, Text} from 'native-base';
import {memo} from 'react';
import {SettingsSharpIcon} from '@/assets/icons/settings_sharp';
import {navigate} from '@/navigation/root_navigation';

type AppBarProps = {
  dayName?: string;
  dateString?: string;
};

function AppBar({dayName, dateString}: AppBarProps = {}) {
  const settingsPressed = () => {
    navigate('Settings');
  };

  return (
    <>
      <StatusBar />
      <HStack
        px="3"
        justifyContent="space-between"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="coolGray.300"
        w="100%">
        <HStack alignItems="center">
          <Text>{dateString}</Text>
        </HStack>
        <HStack
          left="0"
          right="0"
          alignItems="center"
          justifyContent="center"
          position="absolute">
          <Text fontWeight="bold">{dayName}</Text>
        </HStack>

        <Button marginRight="-3" variant="ghost" onPress={settingsPressed}>
          <SettingsSharpIcon size="2xl" />
        </Button>
      </HStack>
    </>
  );
}

export default memo(AppBar);
