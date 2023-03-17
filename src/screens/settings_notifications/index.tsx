import {t} from '@lingui/macro';
import {
  ScrollView,
  IScrollViewProps,
  InfoIcon,
  HStack,
  Text,
} from 'native-base';
import {useCallback, useState} from 'react';
import {DontNotifyUpcomingSetting} from './dont_notify_upcoming_setting';
import {NotifyNextAdhanSetting} from './notify_next_adhan_setting';
import {PreferHeadphoneSetting} from './prefer_headphone_setting';
import {VolumeButtonSetting} from './volume_button_setting';
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
      {...props}>
      {PrayersInOrder.map(p => (
        <NotificationSetting
          key={p.toString()}
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
      <NotifyNextAdhanSetting mb="6" />
      <DontNotifyUpcomingSetting mb="6" />
      <PreferHeadphoneSetting mb="4" />
      <VolumeButtonSetting mb="8" />
    </ScrollView>
  );
}
