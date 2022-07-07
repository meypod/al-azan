import {t} from '@lingui/macro';
import {Box, Pressable, Text, Spacer, HStack, Flex, Button} from 'native-base';
import {translatePrayer} from '@/adhan';
import {DeleteIcon} from '@/assets/icons/delete';
import {EditIcon} from '@/assets/icons/edit';
import {Reminder, settings} from '@/store/settings';

export type ReminderItemProps = {
  item: Reminder;
};

export function ReminderItem(
  onEdit: (reminderState: Reminder) => void,
  {item}: ReminderItemProps,
) {
  const onDelete = () => {
    settings.getState().deleteReminder(item);
  };

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
              : 'coolGray.300:alpha.10',
          }}
          _light={{
            bgColor: isPressed
              ? 'coolGray.800:alpha.20'
              : 'coolGray.800:alpha.10',
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
              <Button onPress={() => onEdit(item)} variant="ghost">
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
            <Text p="3">
              {item.durationModifier === -1
                ? t`${durationInMinutes} min before ${prayer}`
                : t`${durationInMinutes} min after ${prayer}`}
            </Text>
          </HStack>
        </Box>
      )}
    </Pressable>
  );
}
