import {t} from '@lingui/macro';
import {HStack, VStack, Text, IStackProps} from 'native-base';
import {PrayersInOrder} from '@/adhan';
import {NotificationSetting} from '@/screens/settings/subscreens/NotificationSetting';

export function NotificationSettings(props: IStackProps) {
  return (
    <VStack
      p="4"
      alignItems="stretch"
      justifyContent="center"
      space="sm"
      mb="3"
      {...props}>
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
    </VStack>
  );
}
