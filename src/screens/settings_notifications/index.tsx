import {t} from '@lingui/macro';
import {HStack, ScrollView, Text, IScrollViewProps} from 'native-base';
import {PrayersInOrder} from '@/adhan';
import {NotificationSetting} from '@/screens/settings_notifications/notification_setting';

export function NotificationSettings(props: IScrollViewProps) {
  return (
    <ScrollView p="4" mb="3" {...props}>
      <HStack justifyContent="space-between">
        <Text width="1/3">{t`Adhan`}</Text>
        <Text width="1/3" textAlign="center">
          {t`Notification`}
        </Text>
        <Text width="1/6" textAlign="center">
          {t`Sound`}
        </Text>
      </HStack>
      {PrayersInOrder.map(p => (
        <NotificationSetting key={p.toString()} prayer={p} />
      ))}
    </ScrollView>
  );
}
