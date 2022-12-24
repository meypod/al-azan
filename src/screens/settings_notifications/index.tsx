import {t} from '@lingui/macro';
import {HStack, ScrollView, Text, IScrollViewProps} from 'native-base';
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
      <HStack p="2" justifyContent="space-between">
        <Text width="1/3">{t`Time`}</Text>
        <Text width="1/3" textAlign="center">
          {t`Notification`}
        </Text>
        <Text width="1/6" textAlign="center">
          {t`Sound`}
        </Text>
      </HStack>
      {PrayersInOrder.map((p, i) => (
        <NotificationSetting
          p="2"
          key={p.toString()}
          prayer={p}
          backgroundColor={i % 2 === 0 ? 'coolGray.400:alpha.20' : undefined}
        />
      ))}

      <NotifyNextAdhanSetting mt="4" />
    </ScrollView>
  );
}
