import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Select} from 'native-base';
import {useSettings} from '@/store/settings';
import {updateWidgets} from '@/tasks/update_widgets';
import {useNoInitialEffect} from '@/utils/hooks/use_no_initial_effect';

export function CityNamePosSettings(props: IStackProps) {
  const [pos, setPos] = useSettings('WIDGET_CITY_NAME_POS');

  useNoInitialEffect(() => {
    updateWidgets();
  }, [pos]);

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <FormControl.Label>{t`Location`}:</FormControl.Label>
        <FormControl.HelperText>
          {t`You can choose to replace one of calendars with your current location`}
        </FormControl.HelperText>
        <Select
          accessibilityLabel={t`Choose which calendar to replace`}
          onValueChange={setPos as (itemValue: string) => void}
          selectedValue={pos || ''}
          flex="1">
          <Select.Item label={t`None`} value="" />
          <Select.Item label={t`Lunar Calendar`} value="top_start" />
          <Select.Item label={t`Secondary Calendar`} value="top_end" />
        </Select>
      </FormControl>
    </HStack>
  );
}
