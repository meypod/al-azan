import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Switch, Text} from 'native-base';
import {useEffect} from 'react';
import {I18nManager} from 'react-native';
import {isRTL, loadLocale} from '@/i18n';
import {restart} from '@/modules/restart';
import {settings, useSettingsHelper} from '@/store/settings';

export function TimeFormatSettings(props: IStackProps) {
  const [is24Hour, setIs24Hour] = useSettingsHelper('IS_24_HOUR_FORMAT');

  useEffect(() => {
    const unsub = settings.subscribe((state, prevState) => {
      if (state.SELECTED_LOCALE !== prevState.SELECTED_LOCALE) {
        loadLocale(state.SELECTED_LOCALE)
          .then(() => {
            I18nManager.forceRTL(isRTL);
            // allow some time for forceRTL to work
            setTimeout(restart, 200);
          })
          .catch(() => {});
      }
    });

    return unsub;
  });

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <FormControl.Label>{t`Time format`}:</FormControl.Label>
        <HStack justifyContent={'space-between'}>
          <Text>{t`Use 24-Hour format`}</Text>
          <Switch value={is24Hour} onToggle={setIs24Hour} size="lg" />
        </HStack>
      </FormControl>
    </HStack>
  );
}
