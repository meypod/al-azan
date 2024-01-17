import {t} from '@lingui/macro';
import {
  Stack,
  Button,
  HStack,
  VStack,
  Text,
  Select,
  FormControl,
  Input,
  Switch,
} from 'native-base';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {Modal} from 'react-native';
import {Prayer, translatePrayer} from '@/adhan';
import {CloseIcon} from '@/assets/icons/material_icons/close';
import {AudioPicker} from '@/components/audio_picker';
import {NumericInput} from '@/components/numeric_input';
import {WeekDaySelector} from '@/components/week_day_selector';
import type {AudioEntry} from '@/modules/media_player';
import {Reminder} from '@/store/reminder';

const minuteMs = 60 * 1000;
const predefinedMinutes = [5, 10, 15, 30, 60, 90];

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

  const onAudioSelected = useCallback(
    (item: AudioEntry) => {
      setDraftReminderState({
        ...draftReminderState,
        sound: item,
      });
    },
    [draftReminderState],
  );

  useEffect(() => {
    if (reminderState) {
      const eMode = !!Object.keys(reminderState).length;
      setEditMode(eMode);
      setDraftReminderState({
        ...reminderState,
        id: eMode ? reminderState.id : 'reminder_' + Date.now().toString(),
        enabled: true,
        duration: reminderState?.duration || predefinedMinutes[0] * minuteMs,
        durationModifier: reminderState?.durationModifier || -1,
        prayer: reminderState?.prayer || Prayer.Fajr,
      });
    } else {
      setDraftReminderState(null);
    }
  }, [reminderState]);

  const onConfirmProxy = useCallback(() => {
    onConfirm(draftReminderState as Reminder);
    setDraftReminderState(null);
  }, [draftReminderState, onConfirm]);

  const onReminderTimeChanged = useCallback(
    (minutes: string | number) => {
      setDraftReminderState({
        ...draftReminderState,
        duration: parseInt(minutes as string, 10) * minuteMs,
      });
    },
    [draftReminderState],
  );

  const durationInMinutes = useMemo(
    () =>
      draftReminderState?.duration ? draftReminderState.duration / minuteMs : 0,
    [draftReminderState?.duration],
  );

  const [isEditingMinutes, setIsEditingMinutes] = useState(false);

  const durationIsPredefined = useMemo(
    () => !isEditingMinutes && predefinedMinutes.includes(durationInMinutes),
    [durationInMinutes, isEditingMinutes],
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={!!draftReminderState}
      onRequestClose={onCancel}>
      <Stack p="2" bg="black:alpha.40" flex={1} justifyContent="center">
        <Stack
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
            <Stack px="3" flexDirection="row" alignItems="center" flex={1}>
              <Text>{editMode ? t`Edit Reminder` : t`New Reminder`}</Text>
            </Stack>
            <Button
              onPress={onCancel}
              variant="ghost"
              accessibilityLabel={t`Cancel`}>
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
                  {durationIsPredefined ? (
                    <Select
                      accessibilityLabel={t`Time list`}
                      borderRadius={0}
                      borderTopLeftRadius={'sm'}
                      flex={1}
                      selectedValue={durationInMinutes.toString()}
                      onValueChange={onReminderTimeChanged}>
                      <Select.Item
                        label={t`5 min`}
                        value={predefinedMinutes[0].toString()}
                      />
                      <Select.Item
                        label={t`10 min`}
                        value={predefinedMinutes[1].toString()}
                      />
                      <Select.Item
                        label={t`15 min`}
                        value={predefinedMinutes[2].toString()}
                      />
                      <Select.Item
                        label={t`30 min`}
                        value={predefinedMinutes[3].toString()}
                      />
                      <Select.Item
                        label={t`60 min`}
                        value={predefinedMinutes[4].toString()}
                      />
                      <Select.Item
                        label={t`90 min`}
                        value={predefinedMinutes[5].toString()}
                      />
                      <Select.Item label={t`Custom`} value={(1).toString()} />
                    </Select>
                  ) : (
                    <Stack
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="center"
                      flex={1}>
                      <NumericInput
                        flex={1}
                        flexShrink={1}
                        int
                        invalidValue={1}
                        value={durationInMinutes}
                        onChange={onReminderTimeChanged}
                        onTextInput={setIsEditingMinutes.bind(null, true)}
                        onEndEditing={setIsEditingMinutes.bind(null, false)}
                      />
                      <Text flexShrink={0} px="1">{t`minutes`}</Text>
                    </Stack>
                  )}
                  <Select
                    accessibilityLabel={t`Time condition`}
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
                  accessibilityLabel={t`Prayer list`}
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
              <FormControl.Label>{t`Sound`}:</FormControl.Label>
              <AudioPicker
                actionsheetLabel={t`Sound`}
                onItemSelected={onAudioSelected}
                getOptionLabel={item => item.label}
                autoCompleteKeys={['label']}
                selectedItem={draftReminderState?.sound}
                size="sm"
                height="10"
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>{t`Options`}:</FormControl.Label>
              <HStack alignItems="center" justifyContent="space-between" mb="2">
                <Text flexShrink={1}>
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
              <HStack justifyContent="center">
                <WeekDaySelector
                  w={'64'}
                  value={draftReminderState?.days}
                  onChanged={days =>
                    setDraftReminderState({
                      ...draftReminderState,
                      days: days || true,
                    })
                  }
                  justifyContent="center"
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
        </Stack>
      </Stack>
    </Modal>
  );
}
