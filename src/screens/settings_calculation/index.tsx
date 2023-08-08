import {t} from '@lingui/macro';

import {
  FormControl,
  ScrollView,
  IScrollViewProps,
  Text,
  Button,
} from 'native-base';
import {useCallback, useMemo} from 'react';
import {useStore} from 'zustand';
import {CalcParamsBox} from './calc_params_box';
import {CalendarSettings} from './calendar_settings';
import {CalculationMethods} from '@/adhan';
import {CalculationMethodEntry} from '@/adhan/calculation_methods';
import {AutocompleteInput} from '@/components/AutocompleteInput';
import {SafeArea} from '@/components/safe_area';

import {push} from '@/navigation/root_navigation';
import {calcSettings, useCalcSettings} from '@/store/calculation';

export function CalculationSettings(props: IScrollViewProps) {
  const isMethodModified = useStore(
    calcSettings,
    s => s.computed.isCalcParamsModified,
  );

  const [calculationMethodKey, setCalculationMethodKey] = useCalcSettings(
    'CALCULATION_METHOD_KEY',
  );

  const getMethodLabel = useCallback(
    (entry: CalculationMethodEntry) => {
      if (isMethodModified && entry.key !== 'Custom') {
        return entry.label + ' (' + t`Modified` + ')';
      }
      return entry.label;
    },
    [isMethodModified],
  );

  const calculationMethodChanged = useCallback(
    (itemValue: CalculationMethodEntry) => {
      setCalculationMethodKey(itemValue.key);
      calcSettings.setState({
        FAJR_ADJUSTMENT: 0,
        SUNRISE_ADJUSTMENT: 0,
        DHUHR_ADJUSTMENT: 0,
        ASR_ADJUSTMENT: 0,
        MAGHRIB_ADJUSTMENT: 0,
        ISHA_ADJUSTMENT: 0,
        FAJR_ANGLE_OVERRIDE: undefined,
        ISHA_ANGLE_OVERRIDE: undefined,
        MAGHRIB_ANGLE_OVERRIDE: undefined,
        ISHA_INTERVAL_OVERRIDE: undefined,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const selectedMethod = useMemo(
    () =>
      calculationMethodKey
        ? CalculationMethods[calculationMethodKey]
        : undefined,
    [calculationMethodKey],
  );

  const calcMethods = useMemo(
    () =>
      Object.keys(CalculationMethods).map(key => {
        const method =
          CalculationMethods[key as keyof typeof CalculationMethods];
        method.key = key;
        return method;
      }),
    [],
  );

  const goToAdjustments = useCallback(() => {
    push('CalculationAdjustmentsSettings');
  }, []);

  const goToAdvancedSettings = useCallback(() => {
    push('CalculationAdvancedSettings');
  }, []);

  return (
    <SafeArea>
      <ScrollView
        p="4"
        _contentContainerStyle={{paddingBottom: 20}}
        keyboardShouldPersistTaps="handled"
        {...props}>
        <Text mb="5">{t`Calculating Adhan has many different methods. Each method provides different results. It is your responsibility to search and use the right method.`}</Text>
        <FormControl mb="5">
          <FormControl.Label m="0">{t`Calculation Method`}:</FormControl.Label>
          <AutocompleteInput<CalculationMethodEntry>
            actionsheetLabel={t`Calculation Method`}
            accessibilityLabel={t`Choose Calculation Method`}
            data={calcMethods}
            onItemSelected={calculationMethodChanged}
            autoCompleteKeys={['label']}
            getSelectedOptionLabel={getMethodLabel}
            selectedItem={selectedMethod}
            placeholder={t`Press to select a method`}
            errorMessage={t`Error in loading countries`}
          />
          {calculationMethodKey === 'UmmAlQura' && (
            <FormControl.HelperText>{t`30 minutes is added to Isha time during Ramadan in this method`}</FormControl.HelperText>
          )}
          {calculationMethodKey === 'Turkey' && (
            <FormControl.HelperText>{t`Diyanet method provided in Al-Azan is an approximation of the official times. Since there's not enough documentation available on how the times are exactly calculated, times may not align with the official website, especially out of Turkey.`}</FormControl.HelperText>
          )}
          <CalcParamsBox />
        </FormControl>
        <CalendarSettings mb="7" />

        <Button mb="5" onPress={goToAdjustments}>{t`Adjustments`}</Button>

        <Button
          mb="5"
          onPress={
            goToAdvancedSettings
          }>{t`Advanced Calculation Settings`}</Button>
      </ScrollView>
    </SafeArea>
  );
}
