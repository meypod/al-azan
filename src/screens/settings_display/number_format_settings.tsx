import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Select} from 'native-base';
import {useEffect} from 'react';
import {useSettings} from '@/store/settings';
import {updateWidgets} from '@/tasks/update_widgets';

// UPDATE WIDGETS WHEN SETTINGS CHANGES

export function NumberFormatSettings(props: IStackProps) {
  const [numberingSystem, setNumberingSystem] = useSettings('NUMBERING_SYSTEM');

  useEffect(() => {
    updateWidgets();
  }, [numberingSystem]);

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <FormControl.Label>{t`Numbering system`}:</FormControl.Label>
        <FormControl.HelperText>
          {t`forces all numbers to be in the selected system`}
        </FormControl.HelperText>
        <Select
          accessibilityLabel={t`Choose numbering system`}
          onValueChange={setNumberingSystem}
          selectedValue={numberingSystem || ''}
          flex="1">
          <Select.Item label={t`Default`} value="" />
          <Select.Item label={t`Western Arabic`} value="latn" />
          <Select.Item label={t`Eastern Arabic`} value="arab" />
          <Select.Item label={t`Persian`} value="arabext" />
        </Select>
      </FormControl>
    </HStack>
  );
}
