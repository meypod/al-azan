import {useNavigation} from '@react-navigation/native';
import {HStack, StatusBar, Button, Text} from 'native-base';
import {SettingsSharpIcon} from '@/assets/icons/settings_sharp';

type AppBarProps = {
  dayName?: string;
  dd?: string;
  monthName?: string;
};

export function AppBar({dayName, monthName, dd}: AppBarProps = {}) {
  const navigation = useNavigation();

  const settingsPressed = () => {
    navigation.navigate('Settings');
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
