import {t} from '@lingui/macro';
import {
  PolarCircleResolution,
  HighLatitudeRule,
  Madhab,
  Shafaq,
  MidnightMethod,
  Rounding,
} from 'adhan-extended';
import {ScrollView, Select, FormControl, Spacer} from 'native-base';
import {SafeArea} from '@/components/safe_area';
import {useCalcSettings} from '@/store/calculation';

export function CalculationAdvancedSettings() {
  const [highLatitudeRuleSetting, setHighLatitudeRuleSetting] =
    useCalcSettings('HIGH_LATITUDE_RULE');

  const [asrCalculationSetting, setAsrCalculationSetting] =
    useCalcSettings('ASR_CALCULATION');

  const [polarResolutionSetting, setPolarResolutionSetting] =
    useCalcSettings('POLAR_RESOLUTION');

  const [shafaqSetting, setShafaqSetting] = useCalcSettings('SHAFAQ');

  const [midnightMethod, setMidnightMethod] =
    useCalcSettings('MIDNIGHT_METHOD');

  const [roundingMethod, setRoundingMethod] =
    useCalcSettings('ROUNDING_METHOD');

  return (
    <SafeArea>
      <ScrollView p="4">
        <FormControl mb="3">
          <FormControl.Label m="0">{t`Rounding Method`}:</FormControl.Label>
          <Select
            accessibilityLabel={t`Choose calculation rounding method`}
            selectedValue={roundingMethod || ''}
            onValueChange={setRoundingMethod as (str: string) => void}
            flex="1">
            <Select.Item label={t`Auto (Default)`} value={''} />
            <Select.Item label={t`Nearest`} value={Rounding.Nearest} />
            <Select.Item label={t`None`} value={Rounding.None} />
            <Select.Item label={t`Up`} value={Rounding.Up} />
          </Select>
        </FormControl>
        <FormControl mb="3">
          <FormControl.Label m="0">{t`Midnight Method`}:</FormControl.Label>
          <Select
            accessibilityLabel={t`Choose midnight calculation method`}
            selectedValue={midnightMethod || MidnightMethod.SunsetToFajr}
            onValueChange={setMidnightMethod as (str: string) => void}
            flex="1">
            <Select.Item
              label={t`Sunset to Fajr (Default)`}
              value={MidnightMethod.SunsetToFajr}
            />
            <Select.Item
              label={t`Sunset to Sunrise`}
              value={MidnightMethod.SunsetToSunrise}
            />
          </Select>
        </FormControl>
        <FormControl mb="3">
          <FormControl.Label m="0">{t`High Latitude`}:</FormControl.Label>
          <Select
            accessibilityLabel={t`Choose High Latitude Setting`}
            selectedValue={highLatitudeRuleSetting || 'none'}
            onValueChange={setHighLatitudeRuleSetting}
            flex="1">
            <Select.Item label={t`None (Automatic)`} value="none" />
            <Select.Item
              label={t`Middle of the Night`}
              value={HighLatitudeRule.MiddleOfTheNight}
            />
            <Select.Item
              label={t`One-Seventh of the Night`}
              value={HighLatitudeRule.SeventhOfTheNight}
            />
            <Select.Item
              label={t`Twilight Angle`}
              value={HighLatitudeRule.TwilightAngle}
            />
          </Select>
        </FormControl>
        <FormControl mb="3">
          <FormControl.Label m="0">{t`Asr Calculation`}:</FormControl.Label>
          <Select
            accessibilityLabel={t`Choose Asr Calculation Madhab`}
            selectedValue={asrCalculationSetting || Madhab.Shafi}
            onValueChange={setAsrCalculationSetting}
            flex="1">
            <Select.Item
              label={t`Shafi, Maliki, Hanbali (Default)`}
              value={Madhab.Shafi}
            />
            <Select.Item label={t`Hanafi`} value={Madhab.Hanafi} />
          </Select>
        </FormControl>
        <FormControl mb="3">
          <FormControl.Label m="0">{t`Polar Resolution`}:</FormControl.Label>
          <Select
            accessibilityLabel={t`Choose Polar Resolution`}
            onValueChange={setPolarResolutionSetting}
            selectedValue={
              polarResolutionSetting || PolarCircleResolution.Unresolved
            }
            flex="1">
            <Select.Item
              label={t`Unresolved (default)`}
              value={PolarCircleResolution.Unresolved}
            />
            <Select.Item
              label={t`Closest City`}
              value={PolarCircleResolution.AqrabBalad}
            />
            <Select.Item
              label={t`Closest Date`}
              value={PolarCircleResolution.AqrabYaum}
            />
          </Select>
        </FormControl>
        <FormControl mb="3">
          <FormControl.Label m="0">{t`Shafaq`}:</FormControl.Label>
          <FormControl.HelperText my="0">
            {t`Shafaq is used by the MoonsightingCommittee method to 
              determine what type of twilight to use in order to
              determine the time for Isha`}
          </FormControl.HelperText>
          <Select
            mt="1"
            accessibilityLabel={t`Choose Shafaq method`}
            onValueChange={setShafaqSetting}
            selectedValue={shafaqSetting || Shafaq.General}
            flex="1">
            <Select.Item label={t`General (default)`} value={Shafaq.General} />
            <Select.Item label={t`Ahmer`} value={Shafaq.Ahmer} />
            <Select.Item label={t`Abyad`} value={Shafaq.Abyad} />
          </Select>
        </FormControl>
        <Spacer mb="8" />
      </ScrollView>
    </SafeArea>
  );
}
