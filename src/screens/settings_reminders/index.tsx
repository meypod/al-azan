import {t} from '@lingui/macro';
import {IStackProps, FlatList, Box, Button} from 'native-base';
import {useEffect, useState} from 'react';

import {EditReminderModal} from '@/screens/settings_reminders/edit_reminder_modal';
import {ReminderItem} from '@/screens/settings_reminders/reminder_item';
import {Reminder, settings, useSettingsHelper} from '@/store/settings';
import {setNextAdhan} from '@/tasks/set_next_adhan';

let isSettingAdhan = false;

export function RemindersSettings(props: IStackProps) {
  const [reminderEntries] = useSettingsHelper('REMINDERS');
  const [creatingReminder, setCreatingReminder] =
    useState<Partial<Reminder> | null>(null);

  useEffect(() => {
    if (isSettingAdhan) return;
    isSettingAdhan = true;
    setNextAdhan({noToast: true}).finally(() => (isSettingAdhan = false));
  }, [reminderEntries]);

  const onAddReminderPressed = () => {
    // reset new reminder modal
    setCreatingReminder({});
  };
  const saveReminder = (createdReminder: Reminder) => {
    settings.getState().saveReminder(createdReminder);
  };

  const cancelReminderCreation = () => {
    // clear modal
    setCreatingReminder(null);
  };

  return (
    <Box flex={1} safeArea py="3" {...props}>
      <FlatList
        flex={1}
        data={reminderEntries}
        renderItem={ReminderItem.bind(undefined, setCreatingReminder)}
      />
      <Button onPress={onAddReminderPressed} m="1">{t`Add Reminder`}</Button>

      <EditReminderModal
        reminderState={creatingReminder}
        onCancel={cancelReminderCreation}
        onConfirm={editedState => saveReminder(editedState)}
      />
    </Box>
  );
}
