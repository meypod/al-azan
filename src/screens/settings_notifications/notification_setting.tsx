import {i18n} from '@lingui/core';
import {t} from '@lingui/macro';
import {HStack, Text, Checkbox, Stack} from 'native-base';
import {IHStackProps} from 'native-base/lib/typescript/components/primitives/Stack/HStack';
import {Prayer, prayerTranslations} from '@/adhan';
import {
  getAdhanSettingKey,
  useCalcSettingsHelper,
} from '@/store/calculation_settings';

type NotificationSettingProps = {
  prayer: Prayer;
};

export function NotificationSetting({
  prayer,
  ...hStackProps
}: NotificationSettingProps & IHStackProps) {
  const [notify, setNotify] = useCalcSettingsHelper(
    getAdhanSettingKey(prayer, 'notify'),
  );
  const [sound, setSound] = useCalcSettingsHelper(
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
    <HStack justifyContent="space-between" {...hStackProps}>
      <Text width="1/3">{prayerName}</Text>

      <Stack width="1/3" justifyContent="center" alignItems="center">
        <Checkbox
          value="notify"
          isChecked={!!notify}
          onChange={setNotifyProxy}
          accessibilityLabel={t`${prayerName} notification will be shown`}
        />
      </Stack>

      <Stack width="1/6" justifyContent="center" alignItems="center">
        <Checkbox
          value="sound"
          isChecked={!!sound}
          onChange={setSoundProxy}
          accessibilityLabel={t`${prayerName} sound will be played`}
        />
      </Stack>
    </HStack>
  );
}
