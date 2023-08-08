import {useAlarmSettingsMonitor} from './use_alarm_settings_monitor';
import {useCalcSettingsMonitor} from './use_calc_settings_monitor';
import {useReminderSettingsMonitor} from './use_reminder_settings_monitor';
import {useWidgetSettingsMonitor} from './use_widget_settings_monitor';
import {clearCache} from '@/store/adhan_calc_cache';
import {settings} from '@/store/settings';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {setReminders} from '@/tasks/set_reminder';
import {updateWidgets} from '@/tasks/update_widgets';
import {useNoInitialEffect} from '@/utils/hooks/use_no_initial_effect';

export function useSettingsMonitor() {
  const calcSettingsHash = useCalcSettingsMonitor();
  const alarmSettingsHash = useAlarmSettingsMonitor();
  useReminderSettingsMonitor();

  useWidgetSettingsMonitor();

  useNoInitialEffect(() => {
    settings.setState({DELIVERED_ALARM_TIMESTAMPS: {}});
    clearCache();
    setNextAdhan();
    setReminders({noToast: true, force: true});
    updateWidgets();
  }, [calcSettingsHash, alarmSettingsHash]);
}
