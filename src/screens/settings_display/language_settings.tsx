import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Select} from 'native-base';
import {useEffect} from 'react';
import {I18nManager} from 'react-native';
import {isRTL, loadLocale} from '@/i18n';
import {restart} from '@/modules/restart';
import {settings, useSettingsHelper} from '@/store/settings';

type LanguageEntry = {
  label: string;
  value: string;
};

export function LanguageSettings(props: IStackProps) {
  const [lang, setLang] = useSettingsHelper('SELECTED_LOCALE');

  const languageEntries: LanguageEntry[] = [
    {
      label: t`English`,
      value: 'en',
    },
    {
      label: t`Persian`,
      value: 'fa',
    },
    {
      label: t`Arabic`,
      value: 'ar',
    },
  ];

  if (!['en', 'fa', 'ar'].includes(lang)) {
    languageEntries.push({
      label: lang + ' (' + t`Unsupported` + ')',
      value: lang,
    });
  }

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
        <FormControl.Label>{t`Language`}:</FormControl.Label>
        <Select
          selectedValue={lang}
          accessibilityLabel={t`Choose Language`}
          onValueChange={setLang}>
          {languageEntries.map(entry => (
            <Select.Item
              label={entry.label}
              value={entry.value}
              key={entry.value}
            />
          ))}
        </Select>
      </FormControl>
    </HStack>
  );
}
