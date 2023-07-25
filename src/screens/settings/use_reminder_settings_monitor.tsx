import {useEffect} from 'react';
import {useStore} from 'zustand';
import {reminderSettings} from '@/store/reminder';
import {useSettings} from '@/store/settings';
import {sha256} from '@/utils/hash';

export function useReminderSettingsMonitor() {
  const reminderSettingsState = useStore(reminderSettings, state => state);

  const [reminderSettingsHash, setReminderSettingsHash] = useSettings(
    'REMINDER_SETTINGS_HASH',
  );

  useEffect(() => {
    const stateHash = sha256(JSON.stringify(reminderSettingsState));
    if (reminderSettingsHash !== stateHash) {
      setReminderSettingsHash(stateHash);
    }
  }, [reminderSettingsHash, reminderSettingsState, setReminderSettingsHash]);

  return reminderSettingsHash;
}
