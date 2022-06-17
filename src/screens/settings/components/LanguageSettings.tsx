import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Select} from 'native-base';
import {useEffect} from 'react';
import {isRTL, loadLocale} from '@/i18n';
import {useSettingsHelper} from '@/store/settings';

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
    loadLocale(lang).catch(() => {});
  }, [lang]);

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <FormControl.Label flexDirection={isRTL ? 'row-reverse' : 'row'}>
          {t`Language`}:
        </FormControl.Label>
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
