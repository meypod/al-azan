import {t} from '@lingui/macro';
import {
  Box,
  Pressable,
  Text,
  Spacer,
  HStack,
  Flex,
  Button,
  Switch,
} from 'native-base';
import {memo} from 'react';
import {translatePrayer} from '@/adhan';
import {DeleteIcon} from '@/assets/icons/delete';
import {EditIcon} from '@/assets/icons/edit';
import {Reminder} from '@/store/reminder';

export type ReminderItemProps = {
  onEditPress: (reminderState: Reminder) => void;
  onChange: (reminderState: Reminder) => void;
  onDelete: (reminderState: Reminder) => void;
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
}: ReminderItemProps) {
  const onToggle = (state: boolean) => {
    const newReminderState = {...item, enabled: state};
    onChange(newReminderState);
  };

  return (
    <Pressable>
      {({isPressed}) => (
        <Box
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
          <HStack>
            {item.label ? (
              <Flex px="3" flexDirection="row" alignItems="center" flex={1}>
                <Text
                  fontSize="sm"
                  _dark={{
                    borderBottomColor: 'coolGray.300',
                  }}
                  _light={{
                    borderBottomColor: 'coolGray.600',
                  }}
                  borderBottomWidth="1">
                  {item.label}
                </Text>
              </Flex>
            ) : (
              <Spacer />
            )}
            <HStack>
              <Button onPress={onEditPress.bind(null, item)} variant="ghost">
                <EditIcon
                  color="coolGray.300"
                  size="xl"
                  _light={{color: 'coolGray.600'}}
                />
              </Button>
              <Button onPress={onDelete.bind(null, item)} variant="ghost">
                <DeleteIcon color="red.500" size="xl" />
              </Button>
            </HStack>
          </HStack>
          <HStack>
            <Text p="3" flex={1}>
              {getReminderSubtitle(item)}
            </Text>
            <Switch isChecked={item.enabled} onToggle={onToggle} size="lg" />
          </HStack>
        </Box>
      )}
    </Pressable>
  );
}

export default memo(ReminderItem);
