import {ScrollView, IScrollViewProps} from 'native-base';
import {useCallback, useState} from 'react';
import {NotifyNextAdhanSetting} from './notify_next_adhan_setting';
import {Prayer, PrayersInOrder} from '@/adhan';
import NotificationSetting from '@/screens/settings_notifications/notification_setting';

export function NotificationSettings(props: IScrollViewProps) {
  const [expandedPrayer, setExpandedPrayer] = useState<Prayer | undefined>();

  const onExpandChanged = useCallback(
    (isExpanded: boolean, prayer: Prayer) => {
      if (isExpanded) {
        setExpandedPrayer(prayer);
      } else {
        setExpandedPrayer(undefined);
      }
    },
    [setExpandedPrayer],
  );

  return (
    <ScrollView
      p="4"
      _contentContainerStyle={{paddingBottom: 20}}
      mb="3"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      {...props}>
      {PrayersInOrder.map(p => (
        <NotificationSetting
          key={p.toString()}
          prayer={p}
          onExpandChanged={onExpandChanged}
          expanded={expandedPrayer === p}
        />
      ))}

      <NotifyNextAdhanSetting mt="4" />
    </ScrollView>
  );
}
