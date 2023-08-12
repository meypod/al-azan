import {Text, Pressable, Stack} from 'native-base';
import {memo} from 'react';
import {push} from '@/navigation/root_navigation';
import {RootStackParamList, translateRoute} from '@/navigation/types';

type ScreenListItem = {
  name: keyof RootStackParamList;
  icon: typeof Text;
};

type SettingsListItemOptions = {
  item: ScreenListItem;
};

function SettingsListItem({item}: SettingsListItemOptions): JSX.Element {
  return (
    <Pressable onPress={() => push(item.name)}>
      {({isPressed}) => {
        return (
          <Stack
            flexDirection="row"
            backgroundColor={isPressed ? 'coolGray.300:alpha.20' : undefined}
            py="3"
            alignItems="center">
            <item.icon size="4xl" mx="2"></item.icon>
            <Text flex={1} flexWrap="wrap">
              {translateRoute(item.name)}
            </Text>
          </Stack>
        );
      }}
    </Pressable>
  );
}

export default memo(SettingsListItem);
