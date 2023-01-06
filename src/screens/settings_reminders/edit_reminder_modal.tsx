import {t} from '@lingui/macro';
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Flex,
  Select,
  FormControl,
  Input,
  Switch,
} from 'native-base';
import {useEffect, useState} from 'react';
import {Modal} from 'react-native';
import {Prayer, translatePrayer} from '@/adhan';
import {CloseIcon} from '@/assets/icons/close';
import {Reminder} from '@/store/reminder';

const minute = 60 * 1000;
const defaultDuration = 5 * minute;

export type EditReminderModalProps = {
  reminderState: Partial<Reminder> | null;
  onCancel: (...args: any) => void;
  onConfirm: (editedReminderState: Reminder) => void;
};

export function EditReminderModal({
  reminderState,
  onCancel,
  onConfirm,
}: EditReminderModalProps) {
  const [draftReminderState, setDraftReminderState] =
    useState<Partial<Reminder> | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (reminderState) {
      const eMode = !!Object.keys(reminderState).length;
      setEditMode(eMode);
      setDraftReminderState({
        ...reminderState,
        id: eMode ? reminderState.id : 'reminder_' + Date.now().toString(),
        enabled: true,
        duration: reminderState?.duration || defaultDuration,
        durationModifier: reminderState?.durationModifier || -1,
        prayer: reminderState?.prayer || Prayer.Fajr,
      });
    } else {
      setDraftReminderState(null);
    }
  }, [reminderState]);

  const onConfirmProxy = () => {
    onConfirm(draftReminderState as Reminder);
    setDraftReminderState(null);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={!!draftReminderState}
      onRequestClose={onCancel}>
      <Box p="2" bg="black:alpha.40" flex={1} justifyContent="center">
        <Box
          m="5"
          rounded="lg"
          _dark={{
            bg: 'coolGray.800',
          }}
          _light={{
            bg: 'coolGray.100',
          }}>
          <HStack
            borderBottomWidth={1}
            _dark={{
              borderBottomColor: 'coolGray.300:alpha.20',
            }}
            _light={{
              borderBottomColor: 'coolGray.300',
            }}>
            <Flex px="3" flexDirection="row" alignItems="center" flex={1}>
              <Text>{editMode ? t`Edit Reminder` : t`New Reminder`}</Text>
            </Flex>
            <Button onPress={onCancel} variant="ghost">
              <CloseIcon size="xl" />
            </Button>
          </HStack>
          <VStack p="3">
            <FormControl>
              <FormControl.Label>{t`Label`}:</FormControl.Label>
              <Input
                value={draftReminderState?.label || ''}
                onChangeText={text =>
                  setDraftReminderState({...draftReminderState, label: text})
                }
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>{t`Time`}:</FormControl.Label>
              <VStack>
                <HStack minH={12}>
                  <Select
                    borderRadius={0}
                    borderTopLeftRadius={'sm'}
                    flex={1}
                    selectedValue={draftReminderState?.duration?.toString()}
                    onValueChange={d =>
                      setDraftReminderState({
                        ...draftReminderState,
                        duration: parseInt(d, 10),
                      })
                    }>
                    <Select.Item
                      label={t`5 min`}
                      value={defaultDuration.toString()}
                    />
                    <Select.Item
                      label={t`10 min`}
                      value={(10 * minute).toString()}
                    />
                    <Select.Item
                      label={t`15 min`}
                      value={(15 * minute).toString()}
                    />
                    <Select.Item
                      label={t`30 min`}
                      value={(30 * minute).toString()}
                    />
                    <Select.Item
                      label={t`60 min`}
                      value={(60 * minute).toString()}
                    />
                    <Select.Item
                      label={t`90 min`}
                      value={(90 * minute).toString()}
                    />
                  </Select>
                  <Select
                    borderRadius={0}
                    borderTopRightRadius={'sm'}
                    flex={1}
                    selectedValue={
                      draftReminderState?.durationModifier === -1
                        ? 'before'
                        : 'after'
                    }
                    onValueChange={p =>
                      setDraftReminderState({
                        ...draftReminderState,
                        durationModifier: p === 'before' ? -1 : 1,
                      })
                    }>
                    <Select.Item label={t`before`} value={'before'} />
                    <Select.Item label={t`after`} value={'after'} />
                  </Select>
                </HStack>
                <Select
                  minH={12}
                  px="3"
                  borderRadius={0}
                  borderBottomLeftRadius="sm"
                  borderBottomRightRadius="sm"
                  selectedValue={draftReminderState?.prayer}
                  onValueChange={p =>
                    setDraftReminderState({
                      ...draftReminderState,
                      prayer: p as Prayer,
                    })
                  }>
                  {Object.keys(Prayer).map(p => (
                    <Select.Item
                      label={translatePrayer(p)}
                      value={Prayer[p as keyof typeof Prayer]}
                      key={p}
                    />
                  ))}
                </Select>
              </VStack>
            </FormControl>
            <FormControl>
              <FormControl.Label>{t`Options`}:</FormControl.Label>
              <HStack mb="2" alignItems="center" justifyContent="space-between">
                <Text>
                  {t({
                    message: `Play adhan?`,
                    comment: 'shown in add/edit reminder dialog',
                  })}
                </Text>
                <Switch
                  value={!!draftReminderState?.playSound}
                  onToggle={(state: boolean) =>
                    setDraftReminderState({
                      ...draftReminderState,
                      playSound: state,
                    })
                  }
                  size="lg"
                />
              </HStack>
              <HStack alignItems="center" justifyContent="space-between">
                <Text>
                  {t({
                    message: `Only once?`,
                    comment: 'shown in add/edit reminder dialog',
                  })}
                </Text>

                <Switch
                  value={!!draftReminderState?.once}
                  onToggle={(state: boolean) =>
                    setDraftReminderState({
                      ...draftReminderState,
                      once: state,
                    })
                  }
                  size="lg"
                />
              </HStack>
            </FormControl>
          </VStack>
          <HStack
            px="3"
            py="2"
            mt="2"
            _dark={{
              borderTopColor: 'coolGray.300:alpha.20',
            }}
            _light={{
              borderTopColor: 'coolGray.300',
            }}
            borderTopWidth={1}
            justifyContent="space-between">
            <Button onPress={onConfirmProxy}>{t`Confirm`}</Button>
            <Button onPress={onCancel}>{t`Cancel`}</Button>
          </HStack>
        </Box>
      </Box>
    </Modal>
  );
}
