import {Text, Input, HStack, VStack, Button} from 'native-base';
import {IVStackProps} from 'native-base/lib/typescript/components/primitives/Stack/VStack';
import {useCallback, useEffect, useState} from 'react';
import {Prayer, translatePrayer} from '@/adhan';
import {
  type CalcSettingsStore,
  getPrayerAdjustmentSettingKey,
  useCalcSettings,
} from '@/store/calculation';
import useDebounce from '@/utils/hooks/use_debounce';

type AdjustmentSettingProps =
  | {
      prayer: Prayer;
      settingKey?: never;
      label?: never;
    }
  | {
      prayer?: never;
      settingKey: keyof CalcSettingsStore;
      label: string;
    };

export function AdjustmentSetting({
  prayer,
  label,
  settingKey,
  ...hStackProps
}: AdjustmentSettingProps & IVStackProps) {
  const [adjustment, setAdjustment] = useCalcSettings(
    settingKey || getPrayerAdjustmentSettingKey(prayer),
  );

  const [localAdjustment, setLocalAdjustment] = useState(adjustment as number);
  const debouncedAdjustment = useDebounce(localAdjustment, 600);

  const adjustmentLabel =
    typeof label !== 'undefined' ? label : translatePrayer(prayer!);

  const setLocalAdjustmentHelper = useCallback(
    (value: string) => {
      setLocalAdjustment(parseInt(value, 10) || 0);
    },
    [setLocalAdjustment],
  );

  const increaseLocalAdjustmentByOne = () => {
    setLocalAdjustment(localAdjustment + 1);
  };

  const decreaseLocalAdjustmentByOne = () => {
    setLocalAdjustment(localAdjustment - 1);
  };

  useEffect(() => {
    // to set values when user finishes
    setAdjustment(debouncedAdjustment);
  }, [debouncedAdjustment, setAdjustment]);

  useEffect(() => {
    // to reset adjustment when the method changes
    setLocalAdjustment(adjustment as number);
  }, [setLocalAdjustment, adjustment]);

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
          value={localAdjustment.toString()}
          onChangeText={setLocalAdjustmentHelper}
          textAlign={'center'}
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
