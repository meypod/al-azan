import {t} from '@lingui/macro';
import {Button, HStack, Pressable, Text} from 'native-base';
import {memo} from 'react';
import {CheckCircleIcon} from '@/assets/icons/material_icons/check_circle';
import {DeleteIcon} from '@/assets/icons/material_icons/delete';
import {AudioEntry} from '@/modules/media_player';

export type ExtendedAudioEntry = AudioEntry & {
  selected?: boolean;
  playing?: boolean;
};

export type AudioPickerItemOptions = {
  getOptionLabel: (item: AudioEntry) => string;
  onPress: (item: AudioEntry, index: number) => void;
  onDeletePress: (item: AudioEntry) => void;
  item: ExtendedAudioEntry;
  index: number;
  isSelected: boolean;
};

function AudioPickerItem({
  getOptionLabel,
  onPress,
  onDeletePress,
  item,
  index,
  isSelected,
}: AudioPickerItemOptions): JSX.Element {
  return (
    <Pressable
      _light={{backgroundColor: isSelected ? 'gray.200' : undefined}}
      _dark={{backgroundColor: isSelected ? 'gray.700' : undefined}}
      _pressed={{
        _light: {
          backgroundColor: 'gray.300',
        },
        _dark: {
          backgroundColor: 'gray.600',
        },
      }}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      px="2"
      py="3"
      onPress={onPress.bind(null, item, index)}>
      <Text
        fontSize="sm"
        numberOfLines={1}
        flexShrink={1}
        _light={{color: 'dark.200'}}
        _dark={{color: 'light.200'}}>
        {getOptionLabel(item)}
      </Text>
      <HStack alignItems="center">
        {isSelected ? (
          <CheckCircleIcon size="xl" color="primary.500" />
        ) : undefined}
        {item.canDelete ? (
          <Button
            onPress={onDeletePress.bind(null, item)}
            accessibilityLabel={t`Delete`}
            variant="ghost"
            m="-1"
            p="1">
            <DeleteIcon size="xl" color="red.400" />
          </Button>
        ) : undefined}
      </HStack>
    </Pressable>
  );
}

export default memo(AudioPickerItem);
