import {t} from '@lingui/macro';
import {FlatList, Box, Button, IBoxProps} from 'native-base';
import {useState} from 'react';

import {EditReminderModal} from '@/screens/settings_reminders/edit_reminder_modal';
import {ReminderItem} from '@/screens/settings_reminders/reminder_item';
import {Reminder, settings, useSettingsHelper} from '@/store/settings';
import {setReminders} from '@/tasks/set_reminder';

export function RemindersSettings(props: IBoxProps) {
  const [reminderEntries] = useSettingsHelper('REMINDERS');
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

  const onReminderChange = (newReminderState: Reminder) => {
    settings.getState().saveReminder(newReminderState);
    setReminders({reminders: [newReminderState]});
  };

  const onReminderDelete = (newReminderState: Reminder) => {
    settings.getState().deleteReminder(newReminderState);
    // clears the reminder trigger:
    setReminders({reminders: [{...newReminderState, enabled: false}]});
  };

  return (
    <Box flex={1} safeArea py="3" {...props}>
      <FlatList
        flex={1}
        data={reminderEntries}
        renderItem={ReminderItem.bind(undefined, {
          onEditPressed: setCreatingReminder,
          onToggle: onReminderChange,
          onDelete: onReminderDelete,
        })}
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
