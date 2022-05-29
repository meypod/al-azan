import {Box, ScrollView} from 'native-base';
import {useEffect} from 'react';
import {CalculationSettings} from '@/components/settings/CalculationSettings';
import {LocationSettings} from '@/components/settings/LocationSettings';
import {NotificationSettings} from '@/components/settings/NotificationSettings';
import {ThemeSettings} from '@/components/settings/ThemeSettings';
import {useStore as useSettingStore} from '@/store/settings';
import {setNextAdhan} from '@/tasks/set_next_adhan';

export function Settings() {
  const settingsState = useSettingStore(state => state);
  useEffect(() => {
    setNextAdhan();
  }, [settingsState]);

  return (
    <Box safeArea>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        padding="4">
        <ThemeSettings mb="3" />
        <LocationSettings mb="5" />
        <NotificationSettings mb="5" />
        <CalculationSettings mb="3" />
      </ScrollView>
    </Box>
  );
}
