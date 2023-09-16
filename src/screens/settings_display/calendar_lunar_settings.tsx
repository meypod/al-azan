import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Select} from 'native-base';
import {useSettings} from '@/store/settings';
import {updateWidgets} from '@/tasks/update_widgets';
import {useNoInitialEffect} from '@/utils/hooks/use_no_initial_effect';

// UPDATE WIDGETS WHEN SETTINGS CHANGES

export function CalendarLunarSettings(props: IStackProps) {
  const [locale, setLocale] = useSettings(
    'SELECTED_LOCALE_FOR_ARABIC_CALENDAR',
  );

  useNoInitialEffect(() => {
    updateWidgets();
  }, [locale]);

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <FormControl.Label>{t`Lunar Calendar Language`}:</FormControl.Label>
        <FormControl.HelperText>
          {t`You can change the language used for lunar calendar`}
        </FormControl.HelperText>
        <Select
          accessibilityLabel={t`Choose lunar calendar language`}
          onValueChange={setLocale}
          selectedValue={locale || ''}
          flex="1">
          <Select.Item label={t`Default`} value="" />
          <Select.Item label={t`Arabic`} value="ar" />
        </Select>
      </FormControl>
    </HStack>
  );
}
