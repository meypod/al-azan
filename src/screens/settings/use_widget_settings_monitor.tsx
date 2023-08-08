import {useStore} from 'zustand';
import {settings} from '@/store/settings';
import {updateWidgets} from '@/tasks/update_widgets';
import {useNoInitialEffect} from '@/utils/hooks/use_no_initial_effect';

export function useWidgetSettingsMonitor() {
  const HIGHLIGHT_CURRENT_PRAYER = useStore(
    settings,
    s => s.HIGHLIGHT_CURRENT_PRAYER,
  );

  useNoInitialEffect(() => {
    updateWidgets();
  }, [HIGHLIGHT_CURRENT_PRAYER]);
}
