import {Text, HStack, VStack, Button} from 'native-base';
import {IVStackProps} from 'native-base/lib/typescript/components/primitives/Stack/VStack';
import {useCallback, useMemo, useState} from 'react';

import {Prayer, translatePrayer} from '@/adhan';
import {NumericInput} from '@/components/numeric_input';
import {
  type CalcSettingsStore,
  getPrayerAdjustmentSettingKey,
  useCalcSettings,
} from '@/store/calculation';
import useDebounce from '@/utils/hooks/use_debounce';
import {useNoInitialEffect} from '@/utils/hooks/use_no_initial_effect';
import {useUnmounted} from '@/utils/hooks/use_unmounted';
import {sumFloats} from '@/utils/numbers';

type AdjustmentSettingProps = {
  int?: boolean;
  fallbackInitial?: number;
} & (
  | {
      prayer: Prayer;
      settingKey?: never;
      label?: never;
    }
  | {
      prayer?: never;
      settingKey: keyof CalcSettingsStore;
      label: string;
    }
);

export function AdjustmentSetting({
  prayer,
  label,
  settingKey,
  int = true,
  fallbackInitial,
  ...hStackProps
}: AdjustmentSettingProps & IVStackProps) {
  const [adjustment, setAdjustment] = useCalcSettings(
    settingKey || getPrayerAdjustmentSettingKey(prayer),
  );

  const [localAdjustment, setLocalAdjustment] = useState<number | undefined>(
    adjustment !== undefined ? (adjustment as number) : fallbackInitial,
  );
  const localAdjustmentString = useMemo(
    () => (localAdjustment !== undefined ? String(localAdjustment) : ''),
    [localAdjustment],
  );
  const debouncedAdjustment = useDebounce(localAdjustment, 600);

  const adjustmentLabel =
    label !== undefined ? label : translatePrayer(prayer!);

  const increaseLocalAdjustmentByOne = useCallback(() => {
    if (int) {
      setLocalAdjustment(adj => (adj || 0) + 1);
    } else {
      setLocalAdjustment(adj => sumFloats(adj || 0, 0.1));
    }
  }, [int]);

  const decreaseLocalAdjustmentByOne = useCallback(() => {
    if (int) {
      setLocalAdjustment(adj => (adj || 0) - 1);
    } else {
      setLocalAdjustment(adj => sumFloats(adj || 0, -0.1));
    }
  }, [int]);

  useNoInitialEffect(() => {
    // to set values when user finishes
    if (debouncedAdjustment !== undefined) {
      setAdjustment(debouncedAdjustment);
    }
  }, [debouncedAdjustment, setAdjustment]);

  useNoInitialEffect(() => {
    // to reset adjustment when the method changes
    setLocalAdjustment(adjustment as number);
  }, [setLocalAdjustment, adjustment]);

  useUnmounted(() => {
    if (localAdjustment !== undefined && localAdjustment !== fallbackInitial) {
      setAdjustment(localAdjustment);
    }
  });

  return (
    <VStack {...hStackProps} mb="2" flex={1}>
      {adjustmentLabel && (
        <Text
          textAlign={'center'}
          numberOfLines={1}
          maxFontSizeMultiplier={1}
          minimumFontScale={1}
          fontSize={'xs'}>
          {adjustmentLabel}
        </Text>
      )}
      <HStack h="10">
        <Button
          variant="outline"
          onPress={increaseLocalAdjustmentByOne}
          w="10"
          p="0">
          +
        </Button>
        <NumericInput
          borderLeftWidth={0}
          borderRightWidth={0}
          flex={1}
          size="md"
          value={localAdjustmentString}
          onChange={setLocalAdjustment}
          textAlign={'center'}
          int={int}
        />
        <Button
          variant="outline"
          onPress={decreaseLocalAdjustmentByOne}
          w="10"
          p="0">
          -
        </Button>
      </HStack>
    </VStack>
  );
}
