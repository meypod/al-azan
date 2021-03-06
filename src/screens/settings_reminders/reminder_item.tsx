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
import {translatePrayer} from '@/adhan';
import {DeleteIcon} from '@/assets/icons/delete';
import {EditIcon} from '@/assets/icons/edit';
import {Reminder} from '@/store/settings';

export type ReminderItemProps = {
  onEditPressed?: (reminderState: Reminder) => void;
  onToggle?: (reminderState: Reminder) => void;
  onDelete?: (reminderState: Reminder) => void;
};

export function ReminderItem(
  options: ReminderItemProps,
  {item}: {item: Reminder},
) {
  const onDelete =
    (() => options.onDelete && options.onDelete(item)) || (() => {});

  const durationInMinutes = (item.duration / (60 * 1000)).toString();
  const prayer = translatePrayer(item.prayer);

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
              <Button
                onPress={() =>
                  options.onEditPressed && options.onEditPressed(item)
                }
                variant="ghost">
                <EditIcon
                  color="coolGray.300"
                  size="xl"
                  _light={{color: 'coolGray.600'}}
                />
              </Button>
              <Button onPress={onDelete} variant="ghost">
                <DeleteIcon color="red.500" size="xl" />
              </Button>
            </HStack>
          </HStack>
          <HStack>
            <Text p="3" flex={1}>
              {item.durationModifier === -1
                ? t`${durationInMinutes} min before ${prayer}`
                : t`${durationInMinutes} min after ${prayer}`}
            </Text>
            <Switch
              isChecked={item.enabled}
              onValueChange={state => {
                const newReminderState = {...item, enabled: state};
                options.onToggle && options.onToggle(newReminderState);
              }}
              size="lg"
            />
          </HStack>
        </Box>
      )}
    </Pressable>
  );
}
