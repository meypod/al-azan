import {i18n} from '@lingui/core';
import {t} from '@lingui/macro';
import {HStack, Text, Checkbox, Stack} from 'native-base';
import {Prayer, prayerTranslations} from '@/adhan';
import {isRTL} from '@/i18n';
import {getAdhanSettingKey, useSettingsHelper} from '@/store/settings';

type NotificationSettingProps = {
  prayer: Prayer;
};

export function NotificationSetting({prayer}: NotificationSettingProps) {
  const [notify, setNotify] = useSettingsHelper(
    getAdhanSettingKey(prayer, 'notify'),
  );
  const [sound, setSound] = useSettingsHelper(
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

  const prayerName = i18n._(prayerTranslations[prayer.toLowerCase()]);

  return (
    <HStack
      direction={isRTL ? 'row-reverse' : 'row'}
      justifyContent="space-between">
      <Text width="1/3">{prayerName}</Text>

      <Stack width="1/3" justifyContent="center" alignItems="center">
        <Checkbox
          value="notify"
          isChecked={!!notify}
          onChange={setNotifyProxy}
          accessibilityLabel={t`{prayerName} notification will be shown`}
        />
      </Stack>
      <Stack width="1/6" justifyContent="center" alignItems="center">
        <Checkbox
          value="sound"
          isChecked={!!sound}
          onChange={setSoundProxy}
          accessibilityLabel={t`{prayerName} sound will be played`}
        />
      </Stack>
    </HStack>
  );
}