import {t} from '@lingui/macro';
import {
  Stack,
  Pressable,
  Text,
  Spacer,
  HStack,
  Button,
  Switch,
  VStack,
} from 'native-base';
import {memo, useCallback} from 'react';
import {translatePrayer} from '@/adhan';
import {CopyIcon} from '@/assets/icons/material_icons/copy';
import {DeleteIcon} from '@/assets/icons/material_icons/delete';
import {EditIcon} from '@/assets/icons/material_icons/edit';
import {Reminder} from '@/store/reminder';
import {showDeleteDialog} from '@/utils/dialogs';

export type ReminderItemProps = {
  onEditPress: (reminderState: Reminder) => void;
  onChange: (reminderState: Reminder) => void;
  onDelete: (reminderState: Reminder) => void;
  onClonePress: (reminderState: Reminder) => void;
  item: Reminder;
};

export function getReminderSubtitle(reminder: Reminder) {
  const durationInMinutes = (reminder.duration / (60 * 1000)).toString();
  const prayer = translatePrayer(reminder.prayer);

  let subtitle =
    reminder.durationModifier === -1
      ? t`${durationInMinutes} min before ${prayer}`
      : t`${durationInMinutes} min after ${prayer}`;

  if (reminder.once) {
    subtitle += ` (${t`Once`})`;
  }

  return subtitle;
}

function ReminderItem({
  item,
  onDelete = () => {},
  onChange,
  onEditPress,
  onClonePress,
}: ReminderItemProps) {
  const onToggle = useCallback(
    (state: boolean) => {
      const newReminderState = {...item, enabled: state};
      onChange(newReminderState);
    },
    [item, onChange],
  );

  const onDeletePress = useCallback(async () => {
    const agreed = await showDeleteDialog(item.label);
    if (agreed) {
      onDelete(item);
    }
  }, [item, onDelete]);

  return (
    <Pressable onPress={onEditPress.bind(null, item)}>
      {({isPressed}) => (
        <Stack
          flexDirection="row"
          m="2"
          p="3"
          rounded="sm"
          _dark={{
            bgColor: isPressed
              ? 'coolGray.300:alpha.20'
              : item.enabled
              ? 'coolGray.400:alpha.20'
              : 'coolGray.400:alpha.10',
          }}
          _light={{
            bgColor: isPressed
              ? 'coolGray.800:alpha.20'
              : item.enabled
              ? 'coolGray.700:alpha.20'
              : 'coolGray.700:alpha.10',
          }}>
          <VStack flex={1} py="3" px="2">
            <Stack flexDirection="row">
              <Text
                ellipsizeMode="tail"
                noOfLines={1}
                fontSize="sm"
                _dark={{
                  borderBottomColor: 'coolGray.300',
                }}
                _light={{
                  borderBottomColor: 'coolGray.600',
                }}
                borderBottomWidth="1">
                {item.label || ''}
              </Text>
              <Spacer />
            </Stack>
            <Spacer />
            <Text>{getReminderSubtitle(item)}</Text>
          </VStack>
          <VStack>
            <HStack>
              <Button
                accessibilityLabel={t`Edit`}
                onPress={onEditPress.bind(null, item)}
                variant="ghost"
                px="2">
                <EditIcon
                  color="coolGray.300"
                  size="xl"
                  _light={{color: 'coolGray.600'}}
                />
              </Button>
              <Button
                onPress={onDeletePress}
                variant="ghost"
                px="2"
                accessibilityLabel={t`Delete`}>
                <DeleteIcon color="red.500" size="xl" />
              </Button>
            </HStack>
            <HStack>
              <Button
                accessibilityLabel={t`Make a Copy`}
                onPress={onClonePress.bind(null, item)}
                variant="ghost"
                px="2">
                <CopyIcon
                  color="coolGray.300"
                  size="xl"
                  _light={{color: 'coolGray.600'}}
                />
              </Button>
              <Switch isChecked={item.enabled} onToggle={onToggle} size="lg" />
            </HStack>
          </VStack>
        </Stack>
      )}
    </Pressable>
  );
}

export default memo(ReminderItem);
