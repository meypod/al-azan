import {Text, Input, HStack, VStack, Button} from 'native-base';
import {IVStackProps} from 'native-base/lib/typescript/components/primitives/Stack/VStack';
import {useCallback, useMemo, useState} from 'react';
import type {
  NativeSyntheticEvent,
  TextInputEndEditingEventData,
} from 'react-native';
import {Prayer, translatePrayer} from '@/adhan';
import {
  type CalcSettingsStore,
  getPrayerAdjustmentSettingKey,
  useCalcSettings,
} from '@/store/calculation';
import useDebounce from '@/utils/hooks/use_debounce';
import {useUnmounted} from '@/utils/hooks/use_mounted';
import useNoInitialEffect from '@/utils/hooks/use_update_effect';
import {sumFloats} from '@/utils/numbers';

type AdjustmentSettingProps = {
  isFloat?: boolean;
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
  isFloat,
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

  const setLocalAdjustmentHelper = useCallback(
    (value: string) => {
      let parsedValue = NaN;
      if (isFloat) {
        parsedValue = parseFloat(value);
      } else {
        parsedValue = parseInt(value, 10);
      }
      if (Number.isNaN(parsedValue)) {
        setLocalAdjustment(undefined);
      } else {
        setLocalAdjustment(parsedValue);
      }
    },
    [setLocalAdjustment, isFloat],
  );

  const setLocalAdjustmentHelperForced = useCallback(
    (e: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
      if (!e.nativeEvent.text) {
        setLocalAdjustmentHelper('0');
      }
    },
    [setLocalAdjustmentHelper],
  );

  const increaseLocalAdjustmentByOne = useCallback(() => {
    if (isFloat) {
      setLocalAdjustment(adj => sumFloats(adj || 0, 0.1));
    } else {
      setLocalAdjustment(adj => (adj || 0) + 1);
    }
  }, [isFloat]);

  const decreaseLocalAdjustmentByOne = useCallback(() => {
    if (isFloat) {
      setLocalAdjustment(adj => sumFloats(adj || 0, -0.1));
    } else {
      setLocalAdjustment(adj => (adj || 0) - 1);
    }
  }, [isFloat]);

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
    if (localAdjustment !== undefined && localAdjustment !== adjustment) {
      setAdjustment(localAdjustment);
    }
  }, [localAdjustment, setAdjustment]);

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
        <Input
          borderLeftWidth={0}
          borderRightWidth={0}
          flex={1}
          size="md"
          keyboardType="numeric"
          value={localAdjustmentString}
          onChangeText={setLocalAdjustmentHelper}
          textAlign={'center'}
          onEndEditing={setLocalAdjustmentHelperForced}
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
