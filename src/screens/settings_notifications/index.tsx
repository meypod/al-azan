import {ScrollView, IScrollViewProps} from 'native-base';
import {NotifyNextAdhanSetting} from './notify_next_adhan_setting';
import {PrayersInOrder} from '@/adhan';
import {NotificationSetting} from '@/screens/settings_notifications/notification_setting';

export function NotificationSettings(props: IScrollViewProps) {
  return (
    <ScrollView
      p="4"
      _contentContainerStyle={{paddingBottom: 20}}
      mb="3"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      {...props}>
      {PrayersInOrder.map(p => (
        <NotificationSetting key={p.toString()} prayer={p} />
      ))}

      <NotifyNextAdhanSetting mt="4" />
    </ScrollView>
  );
}
