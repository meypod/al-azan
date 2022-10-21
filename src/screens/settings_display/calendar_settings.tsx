import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Select} from 'native-base';
import {useEffect} from 'react';
import {useSettingsHelper} from '@/store/settings';
import {updateWidgets} from '@/tasks/update_widgets';

// UPDATE WIDGETS WHEN SETTINGS CHANGES

export function CalendarSettings(props: IStackProps) {
  const [arabicCalendar, setArabicCalendar] = useSettingsHelper(
    'SELECTED_ARABIC_CALENDAR',
  );

  useEffect(() => {
    updateWidgets();
  }, [arabicCalendar]);

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <FormControl.Label>{t`Calendar`}:</FormControl.Label>
        <FormControl.HelperText>
          {t`The type of calendar shown in main screen and widgets`}
        </FormControl.HelperText>
        <Select
          accessibilityLabel={t`Choose calendar type`}
          onValueChange={setArabicCalendar}
          selectedValue={arabicCalendar || ''}
          flex="1">
          <Select.Item label={t`Default`} value="" />
          <Select.Item label={t`Islamic`} value="islamic" />
          <Select.Item
            label={t`Islamic (Umm al-Qura)`}
            value="islamic-umalqura"
          />
          <Select.Item label={t`Islamic (tabular)`} value="islamic-tbla" />
          <Select.Item label={t`Islamic (civil)`} value="islamic-civil" />
          <Select.Item
            label={t`Islamic (Saudi Arabia sighting)`}
            value="islamic-rgsa"
          />
        </Select>
      </FormControl>
    </HStack>
  );
}
