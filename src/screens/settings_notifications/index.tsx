import {t} from '@lingui/macro';
import {
  ScrollView,
  IScrollViewProps,
  InfoIcon,
  HStack,
  Text,
  Button,
} from 'native-base';
import {useCallback, useState} from 'react';
import {BypassDnDSetting} from './bypass_dnd_setting';
import {DontNotifyUpcomingSetting} from './dont_notify_upcoming_setting';
import {VibrationSetting} from './vibration_setting';
import {Prayer, PrayersInOrder} from '@/adhan';
import {SafeArea} from '@/components/safe_area';
import {push} from '@/navigation/root_navigation';
import {NotificationSetting} from '@/screens/settings_notifications/notification_setting';

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

  const goToAdvancedSettings = useCallback(() => {
    push('NotificationAdvancedSettings');
  }, []);

  return (
    <SafeArea>
      <ScrollView
        p="4"
        _contentContainerStyle={{paddingBottom: 20}}
        mb="3"
        {...props}>
        {PrayersInOrder.map(p => (
          <NotificationSetting
            key={p}
            prayer={p}
            onExpandChanged={onExpandChanged}
            expanded={expandedPrayer === p}
          />
        ))}
        <HStack p="1" alignItems="flex-start" mb="6">
          <Text
            fontSize="xs"
            _dark={{
              color: 'muted.400',
            }}
            _light={{
              color: 'muted.500',
            }}
            flexShrink={1}>
            <InfoIcon
              _dark={{
                color: 'muted.400',
              }}
              _light={{
                color: 'muted.500',
              }}
            />{' '}
            {t`Tahajjud time mentioned in the app is the last third of the night`}
          </Text>
        </HStack>

        <DontNotifyUpcomingSetting mb="6" />
        <BypassDnDSetting mb="8" />
        <VibrationSetting mb="8" />

        <Button
          mb="5"
          onPress={goToAdvancedSettings}>{t`Advanced Settings`}</Button>
      </ScrollView>
    </SafeArea>
  );
}
