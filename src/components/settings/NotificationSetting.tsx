import {i18n} from '@lingui/core';
import {HStack, Text, Checkbox, Stack} from 'native-base';
import {Prayer, prayerTranslations} from '@/adhan';
import {getAdhanSettingKey} from '@/constants/settings';
import {isRTL} from '@/i18n';
import {useStoreHelper} from '@/store/settings';

type NotificationSettingProps = {
  prayer: Prayer;
};

export function NotificationSetting({prayer}: NotificationSettingProps) {
  const [notify, setNotify] = useStoreHelper<boolean>(
    getAdhanSettingKey(prayer, 'notify'),
  );
  const [sound, setSound] = useStoreHelper<boolean>(
    getAdhanSettingKey(prayer, 'sound'),
  );

  const setSoundProxy = (s: boolean) => {
    if (s) {
      setNotify(s);
    }
    setSound(s);
  };

  const setNotifyProxy = (s: boolean) => {
    if (!s) {
      setSound(s);
    }
    setNotify(s);
  };

  return (
    <HStack
      direction={isRTL ? 'row-reverse' : 'row'}
      justifyContent="space-between">
      <Text width="1/3">
        {i18n._(prayerTranslations[prayer.toLowerCase()])}
      </Text>

      <Stack width="1/3" justifyContent="center" alignItems="center">
        <Checkbox
          value="notify"
          isChecked={!!notify}
          onChange={setNotifyProxy}
          accessibilityLabel={prayer + ' notification will be shown'}
        />
      </Stack>
      <Stack width="1/6" justifyContent="center" alignItems="center">
        <Checkbox
          value="sound"
          isChecked={!!sound}
          onChange={setSoundProxy}
          accessibilityLabel={prayer + ' sound will be played'}
        />
      </Stack>
    </HStack>
  );
}
