import {ScrollView} from 'native-base';
import {CustomUpcomingTimeSetting} from './custom_upcoming_time_setting';
import {DontTurnOnScreenSetting} from './dont_turn_on_screen';
import {NotifyNextAdhanSetting} from './notify_next_adhan_setting';
import {PreferHeadphoneSetting} from './prefer_headphone_setting';
import {VolumeButtonSetting} from './volume_button_setting';
import {SafeArea} from '@/components/safe_area';

export function NotificationAdvancedSettings() {
  return (
    <SafeArea>
      <ScrollView p="4">
        <NotifyNextAdhanSetting mb="6" />
        <PreferHeadphoneSetting mb="4" />
        <VolumeButtonSetting mb="8" />
        <CustomUpcomingTimeSetting mb="8" />
        <DontTurnOnScreenSetting mb="8" />
      </ScrollView>
    </SafeArea>
  );
}
