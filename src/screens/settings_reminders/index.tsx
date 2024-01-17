import {t} from '@lingui/macro';
import {FlatList, Stack, Button, IStackProps} from 'native-base';
import {useCallback, useState} from 'react';
import {ListRenderItemInfo} from 'react-native';
import {SafeArea} from '@/components/safe_area';
import {EditReminderModal} from '@/screens/settings_reminders/edit_reminder_modal';
import ReminderItem from '@/screens/settings_reminders/reminder_item';
import {
  Reminder,
  reminderSettings,
  useReminderSettings,
} from '@/store/reminder';
import {setReminders} from '@/tasks/set_reminder';

export function RemindersSettings(props: IStackProps) {
  const [reminderEntries] = useReminderSettings('REMINDERS');
  const [creatingReminder, setCreatingReminder] =
    useState<Partial<Reminder> | null>(null);

  const onAddReminderPressed = () => {
    // reset and show new reminder modal
    setCreatingReminder({
      days: true,
    });
  };

  const cancelReminderCreation = () => {
    // clear modal
    setCreatingReminder(null);
  };

  const onReminderChange = useCallback((newReminderState: Reminder) => {
    reminderSettings.getState().saveReminder(newReminderState);
    setReminders({reminders: [newReminderState], force: true});
  }, []);

  const onReminderDelete = useCallback((newReminderState: Reminder) => {
    reminderSettings.getState().deleteReminder(newReminderState);
    // clears the reminder trigger:
    setReminders({
      reminders: [{...newReminderState, enabled: false}],
    });
  }, []);

  const onCloneReminder = useCallback((reminder: Reminder) => {
    let newLabel = (reminder.label || '') + ' (' + t`Copy` + ')';
    const newReminder: Reminder = {
      ...reminder,
      id: 'reminder_' + Date.now().toString(),
      label: newLabel,
      enabled: false,
    };
    reminderSettings.getState().saveReminder(newReminder);
  }, []);

  const renderItemMemoized = useCallback(
    ({item}: ListRenderItemInfo<Reminder>) => {
      return (
        <ReminderItem
          onClonePress={onCloneReminder}
          onEditPress={setCreatingReminder}
          onChange={onReminderChange}
          onDelete={onReminderDelete}
          item={item}
        />
      );
    },
    [onCloneReminder, onReminderChange, onReminderDelete],
  );

  return (
    <SafeArea>
      <Stack flex={1} py="3" {...props}>
        <FlatList
          flex={1}
          data={reminderEntries}
          renderItem={renderItemMemoized}
        />
        <Button
          onPress={onAddReminderPressed}
          mx="2"
          mt="2">{t`Add Reminder`}</Button>

        <EditReminderModal
          reminderState={creatingReminder}
          onCancel={cancelReminderCreation}
          onConfirm={editedState => onReminderChange(editedState)}
        />
      </Stack>
    </SafeArea>
  );
}
