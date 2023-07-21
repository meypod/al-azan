import {i18n} from '@lingui/core';
import {t} from '@lingui/macro';
import {
  PolarCircleResolution,
  HighLatitudeRule,
  Madhab,
  Shafaq,
  MidnightMethod,
} from 'adhan-extended';
import {
  Select,
  FormControl,
  Accordion,
  ScrollView,
  IScrollViewProps,
  Text,
} from 'native-base';

import {useCallback} from 'react';
import {CalendarSettings} from './calendar_settings';
import {CalculationMethods} from '@/adhan';
import {MenuIcon} from '@/assets/icons/material_icons/menu';
import {AdjustmentSettings} from '@/screens/settings_calculation/adjustment_settings';
import {useCalcSettings} from '@/store/calculation';

export function CalculationSettings(props: IScrollViewProps) {
  const [calculationMethodKey, setCalculationMethodKey] = useCalcSettings(
    'CALCULATION_METHOD_KEY',
  );

  const [, setFajrAdjustment] = useCalcSettings('FAJR_ADJUSTMENT');
  const [, setSunriseAdjustment] = useCalcSettings('SUNRISE_ADJUSTMENT');
  const [, setDhuhrAdjustment] = useCalcSettings('DHUHR_ADJUSTMENT');
  const [, setAsrAdjustment] = useCalcSettings('ASR_ADJUSTMENT');
  const [, setMaghribAdjustment] = useCalcSettings('MAGHRIB_ADJUSTMENT');
  const [, setIshaAdjustment] = useCalcSettings('ISHA_ADJUSTMENT');

  const [highLatitudeRuleSetting, setHighLatitudeRuleSetting] =
    useCalcSettings('HIGH_LATITUDE_RULE');

  const [asrCalculationSetting, setAsrCalculationSetting] =
    useCalcSettings('ASR_CALCULATION');

  const [polarResolutionSetting, setPolarResolutionSetting] =
    useCalcSettings('POLAR_RESOLUTION');

  const [shafaqSetting, setShafaqSetting] = useCalcSettings('SHAFAQ');

  const [midnightMethod, setMidnightMethod] =
    useCalcSettings('MIDNIGHT_METHOD');

  const calculationMethodKeyChanged = useCallback(
    (itemValue: string) => {
      setCalculationMethodKey(itemValue);
      setFajrAdjustment(0);
      setSunriseAdjustment(0);
      setDhuhrAdjustment(0);
      setAsrAdjustment(0);
      setMaghribAdjustment(0);
      setIshaAdjustment(0);
    },
    [
      setAsrAdjustment,
      setCalculationMethodKey,
      setDhuhrAdjustment,
      setFajrAdjustment,
      setIshaAdjustment,
      setMaghribAdjustment,
      setSunriseAdjustment,
    ],
  );

  return (
    <ScrollView p="4" _contentContainerStyle={{paddingBottom: 20}} {...props}>
      <Text mb="5">{t`Calculating Adhan has many different methods. Each method provides different results. It is your responsibility to search and use the right method.`}</Text>
      <FormControl mb="5">
        <FormControl.Label m="0">{t`Calculation Method`}:</FormControl.Label>
        <Select
          selectedValue={calculationMethodKey}
          accessibilityLabel={t`Choose Calculation Method`}
          onValueChange={calculationMethodKeyChanged}>
          {Object.keys(CalculationMethods).map(key => (
            <Select.Item
              label={i18n._((CalculationMethods as any)[key].label)}
              value={key}
              key={key}
            />
          ))}
        </Select>
        {calculationMethodKey === 'UmmAlQura' && (
          <FormControl.HelperText>{t`30 minutes is added to Isha time during Ramadan in this method`}</FormControl.HelperText>
        )}
        {calculationMethodKey === 'Turkey' && (
          <FormControl.HelperText>{t`Diyanet method provided in Al-Azan is an approximation of the official times. Since there's not enough documentation available on how the times are exactly calculated, times may not align with the official website, especially out of Turkey.`}</FormControl.HelperText>
        )}
      </FormControl>
      <CalendarSettings mb="7" />
      <Accordion mb="5" borderRadius={0}>
        <Accordion.Item>
          <Accordion.Summary>
            {t`Adjustments`}
            <MenuIcon></MenuIcon>
          </Accordion.Summary>
          <Accordion.Details>
            <AdjustmentSettings />
          </Accordion.Details>
        </Accordion.Item>
      </Accordion>
      <Accordion mb="5" borderRadius={0}>
        <Accordion.Item>
          <Accordion.Summary>
            {t`Advanced Calculation Settings`}
            <MenuIcon></MenuIcon>
          </Accordion.Summary>
          <Accordion.Details>
            <FormControl mb="3">
              <FormControl.Label m="0">{t`Midnight Method`}:</FormControl.Label>
              <Select
                accessibilityLabel={t`Choose midnight calculation method`}
                selectedValue={midnightMethod || MidnightMethod.Standard}
                onValueChange={setMidnightMethod as (str: string) => void}
                flex="1">
                <Select.Item
                  label={t`Default (Mid Sunset to Sunrise)`}
                  value={MidnightMethod.Standard}
                />
                <Select.Item
                  label={t`Jafari (Mid Sunset to Fajr)`}
                  value={MidnightMethod.Jafari}
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
              <FormControl.Label m="0">
                {t`Polar Resolution`}:
              </FormControl.Label>
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
                <Select.Item
                  label={t`General (default)`}
                  value={Shafaq.General}
                />
                <Select.Item label={t`Ahmer`} value={Shafaq.Ahmer} />
                <Select.Item label={t`Abyad`} value={Shafaq.Abyad} />
              </Select>
            </FormControl>
          </Accordion.Details>
        </Accordion.Item>
      </Accordion>
    </ScrollView>
  );
}
