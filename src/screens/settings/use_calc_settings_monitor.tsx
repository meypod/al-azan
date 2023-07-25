import {useEffect} from 'react';
import {useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import {calcSettings} from '@/store/calculation';
import {settings, useSettings} from '@/store/settings';
import {sha256} from '@/utils/hash';

export function useCalcSettingsMonitor() {
  const [calcSettingsHash, setCalcSettingsHash] =
    useSettings('CALC_SETTINGS_HASH');

  const {calendarType, selectedAdhans, BYPASS_DND} = useStore(
    settings,
    s => ({
      calendarType: s.SELECTED_ARABIC_CALENDAR,
      selectedAdhans: s.SELECTED_ADHAN_ENTRIES,
      BYPASS_DND: s.BYPASS_DND,
    }),
    shallow,
  );

  const calcSettingsState = useStore(calcSettings, state => state);

  useEffect(() => {
    const stateHash = sha256(
      JSON.stringify(calcSettingsState) +
        calendarType +
        BYPASS_DND +
        JSON.stringify(selectedAdhans),
    );
    if (calcSettingsHash !== stateHash) {
      setCalcSettingsHash(stateHash);
    }
  }, [
    calcSettingsState,
    calcSettingsHash,
    setCalcSettingsHash,
    calendarType,
    selectedAdhans,
    BYPASS_DND,
  ]);

  return calcSettingsHash;
}
