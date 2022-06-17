import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Select} from 'native-base';
import {useEffect} from 'react';
import {isRTL, loadLocale} from '@/i18n';
import {settings, useSettingsHelper} from '@/store/settings';

type LanguageEntry = {
  label: string;
  value: string;
};

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

const userLang = settings.getState().SELECTED_LOCALE;

if (!['en', 'fa', 'ar'].includes(userLang)) {
  languageEntries.push({
    label: userLang + ' (' + t`Unsupported` + ')',
    value: userLang,
  });
}

export function LanguageSettings(props: IStackProps) {
  const [lang, setLang] = useSettingsHelper('SELECTED_LOCALE');

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
