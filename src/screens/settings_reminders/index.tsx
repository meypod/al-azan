import {t} from '@lingui/macro';
import {FlatList, Box, Button, IBoxProps} from 'native-base';
import {useCallback, useMemo, useState} from 'react';

import {EditReminderModal} from '@/screens/settings_reminders/edit_reminder_modal';
import {ReminderItem} from '@/screens/settings_reminders/reminder_item';
import {
  Reminder,
  reminderSettings,
  useReminderSettingsHelper,
} from '@/store/reminder';
import {setReminders} from '@/tasks/set_reminder';

export function RemindersSettings(props: IBoxProps) {
  const [reminderEntries] = useReminderSettingsHelper('REMINDERS');
  const [creatingReminder, setCreatingReminder] =
    useState<Partial<Reminder> | null>(null);

  const onAddReminderPressed = () => {
    // reset and show new reminder modal
    setCreatingReminder({});
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
    setReminders({reminders: [{...newReminderState, enabled: false}]});
  }, []);

  const renderItemMemoized = useMemo(() => {
    return ReminderItem.bind(undefined, {
      onEditPressed: setCreatingReminder,
      onToggle: onReminderChange,
      onDelete: onReminderDelete,
    });
  }, [onReminderChange, onReminderDelete]);

  return (
    <Box flex={1} safeArea py="3" {...props}>
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
    </Box>
  );
}
