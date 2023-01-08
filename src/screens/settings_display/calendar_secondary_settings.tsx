import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Select} from 'native-base';
import {useSettingsHelper} from '@/store/settings';
import {updateWidgets} from '@/tasks/update_widgets';
import useNoInitialEffect from '@/utils/hooks/use_update_effect';

// UPDATE WIDGETS WHEN SETTINGS CHANGES

export function CalendarSecondarySettings(props: IStackProps) {
  const [secondaryCalander, setSecondaryCalendar] = useSettingsHelper(
    'SELECTED_SECONDARY_CALENDAR',
  );

  useNoInitialEffect(() => {
    updateWidgets();
  }, [secondaryCalander]);

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <FormControl.Label>{t`Secondary Calendar`}:</FormControl.Label>
        <FormControl.HelperText>
          {t`The type of calendar that is shown on top of home screen and beside lunar date in widgets`}
        </FormControl.HelperText>
        <Select
          accessibilityLabel={t`Choose calendar type`}
          onValueChange={setSecondaryCalendar}
          selectedValue={secondaryCalander || 'gregory'}
          flex="1">
          <Select.Item label={t`Gregorian`} value="gregory" />
          <Select.Item label={t`Solar Hijri`} value="persian" />
          <Select.Item label={t`Ethiopic`} value="ethiopic" />
          <Select.Item label={t`Thai Solar`} value="buddhist" />
        </Select>
      </FormControl>
    </HStack>
  );
}
