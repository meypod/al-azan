import {t} from '@lingui/macro';
import {HStack, VStack, Text, IStackProps} from 'native-base';
import {PrayersInOrder} from '@/adhan';
import {NotificationSetting} from '@/components/settings/NotificationSetting';
import {isRTL} from '@/i18n';

export function NotificationSettings(props: IStackProps) {
  return (
    <VStack
      alignItems="stretch"
      justifyContent="center"
      space="sm"
      mb="3"
      {...props}>
      <HStack
        direction={isRTL ? 'row-reverse' : 'row'}
        justifyContent="space-between">
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
