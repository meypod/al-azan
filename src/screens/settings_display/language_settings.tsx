import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Select} from 'native-base';
import {useEffect} from 'react';
import {loadLocale} from '@/i18n';
import {restart} from '@/modules/activity';
import {settings, useSettings} from '@/store/settings';

type LanguageEntry = {
  label: string;
  value: string;
};

export function LanguageSettings(props: IStackProps) {
  const [lang, setLang] = useSettings('SELECTED_LOCALE');

  const languageEntries: LanguageEntry[] = [
    {
      label: `English`,
      value: 'en',
    },
    {
      label: `فارسی`,
      value: 'fa',
    },
    {
      label: `العربیة`,
      value: 'ar',
    },
    {
      label: `Türkçe`,
      value: 'tr',
    },
    {
      label: `Indonesia`,
      value: 'id',
    },
    {
      label: `Français`,
      value: 'fr',
    },
    {
      label: `اُردُو`,
      value: 'ur',
    },
    {
      label: `हिन्दी`,
      value: 'hi',
    },
    {
      label: `Deutsch`,
      value: 'de',
    },
    {
      label: `Bosanski`,
      value: 'bs',
    },
    {
      label: `Tiếng Việt`,
      value: 'vi',
    },
    {
      label: `বাংলা`,
      value: 'bn',
    },
  ];

  if (
    ![
      'en',
      'fa',
      'ar',
      'tr',
      'id',
      'fr',
      'ur',
      'hi',
      'de',
      'bs',
      'vi',
    ].includes(lang)
  ) {
    languageEntries.push({
      label: lang + ' (' + t`Unsupported` + ')',
      value: lang,
    });
  }

  useEffect(() => {
    const unsub = settings.subscribe((state, prevState) => {
      if (state.SELECTED_LOCALE !== prevState.SELECTED_LOCALE) {
        loadLocale(state.SELECTED_LOCALE);
        // allow some time for forceRTL to work
        setTimeout(restart, 300);
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
