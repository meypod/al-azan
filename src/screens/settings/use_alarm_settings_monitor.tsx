import {useEffect} from 'react';
import {useStore} from 'zustand';
import {alarmSettings} from '@/store/alarm';
import {useSettings} from '@/store/settings';
import {sha256} from '@/utils/hash';
import {askPermissions} from '@/utils/permission';

export function useAlarmSettingsMonitor() {
  const alarmSettingsState = useStore(alarmSettings, state => state);
  const [alarmSettingsHash, setAlarmSettingsHash] = useSettings(
    'ALARM_SETTINGS_HASH',
  );

  useEffect(() => {
    const stateHash = sha256(JSON.stringify(alarmSettingsState));
    if (alarmSettingsHash !== stateHash) {
      askPermissions().then(() => {
        setAlarmSettingsHash(stateHash);
      });
    }
  }, [alarmSettingsState, alarmSettingsHash, setAlarmSettingsHash]);

  return alarmSettingsHash;
}
