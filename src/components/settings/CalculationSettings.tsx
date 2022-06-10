import {i18n} from '@lingui/core';
import {t} from '@lingui/macro';
import {PolarCircleResolution, HighLatitudeRule, Madhab} from 'adhan';
import {VStack, HStack, IStackProps, Select, FormControl} from 'native-base';

import {CalculationMethods} from '@/adhan';
import {
  ASR_CALCULATION,
  CALCULATION_METHOD_KEY,
  HIGH_LATITUDE_RULE,
  POLAR_RESOLUTION,
} from '@/constants/settings';
import {useStoreHelper} from '@/store/settings';

export function CalculationSettings(props: IStackProps) {
  const [calculationMethodKey, setCalculationMethodKey] =
    useStoreHelper<string>(CALCULATION_METHOD_KEY);

  const [highLatitudeRuleSetting, setHighLatitudeRuleSetting] =
    useStoreHelper<string>(HIGH_LATITUDE_RULE);

  const [asrCalculationSetting, setAsrCalculationSetting] =
    useStoreHelper<string>(ASR_CALCULATION);

  const [polarResolutionSetting, setPolarResolutionSetting] =
    useStoreHelper<string>(POLAR_RESOLUTION);

  const calculationMethodKeyChanged = (itemValue: string) => {
    setCalculationMethodKey(itemValue);
  };

  const highLatitudeSettingChanged = (itemValue: string) => {
    setHighLatitudeRuleSetting(itemValue);
  };

  const asrCalculationSettingChanged = (itemValue: string) => {
    setAsrCalculationSetting(itemValue);
  };

  const polarResolutionSettingChanged = (itemValue: string) => {
    setPolarResolutionSetting(itemValue);
  };

  return (
    <VStack {...props}>
      <FormControl mb="3">
        <HStack alignItems="center">
          <FormControl.Label m="0">{t`Calculation Method`}:</FormControl.Label>
          <Select
            selectedValue={calculationMethodKey}
            ml="1"
            height="8"
            accessibilityLabel={t`Choose Calculation Method`}
            onValueChange={calculationMethodKeyChanged}
            flex="1">
            {Object.keys(CalculationMethods).map(key => (
              <Select.Item
                label={i18n._((CalculationMethods as any)[key].label)}
                value={key}
                key={key}
              />
            ))}
          </Select>
        </HStack>
      </FormControl>
      <FormControl mb="3">
        <HStack alignItems="center">
          <FormControl.Label m="0">{t`High Latitude`}:</FormControl.Label>
          <Select
            ml="1"
            height="8"
            accessibilityLabel={t`Choose High Latitude Setting`}
            selectedValue={highLatitudeRuleSetting || 'none'}
            onValueChange={highLatitudeSettingChanged}
            flex="1">
            <Select.Item label={t`None (Automatic)`} value="none" />
            <Select.Item
              label={t`Middle of the Night`}
              value={HighLatitudeRule.MiddleOfTheNight.toString()}
            />
            <Select.Item
              label={t`One-Seventh of the Night`}
              value={HighLatitudeRule.SeventhOfTheNight.toString()}
            />
            <Select.Item
              label={t`Twilight Angle`}
              value={HighLatitudeRule.TwilightAngle.toString()}
            />
          </Select>
        </HStack>
      </FormControl>
      <FormControl mb="3">
        <HStack alignItems="center">
          <FormControl.Label m="0">{t`Asr Calculation`}:</FormControl.Label>
          <Select
            ml="1"
            height="8"
            accessibilityLabel={t`Choose Asr Calculation Madhab`}
            selectedValue={asrCalculationSetting || Madhab.Shafi.toString()}
            onValueChange={asrCalculationSettingChanged}
            flex="1">
            <Select.Item
              label={t`Shafi (Default)`}
              value={Madhab.Shafi.toString()}
            />
            <Select.Item label="{t`Hanafi`}" value={Madhab.Hanafi.toString()} />
          </Select>
        </HStack>
      </FormControl>
      <FormControl mb="3">
        <HStack alignItems="center">
          <FormControl.Label m="0">{t`Polar Resolution`}:</FormControl.Label>
          <Select
            ml="1"
            height="8"
            accessibilityLabel={t`Choose Polar Resolution`}
            onValueChange={polarResolutionSettingChanged}
            selectedValue={
              polarResolutionSetting ||
              PolarCircleResolution.Unresolved.toString()
            }
            flex="1">
            <Select.Item
              label={t`Unresolved (default)`}
              value={PolarCircleResolution.Unresolved.toString()}
            />
            <Select.Item
              label={t`Closest City`}
              value={PolarCircleResolution.AqrabBalad.toString()}
            />
            <Select.Item
              label={t`Closest Date`}
              value={PolarCircleResolution.AqrabYaum.toString()}
            />
          </Select>
        </HStack>
      </FormControl>
    </VStack>
  );
}
