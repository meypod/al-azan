import {Text, Input, VStack, Button} from 'native-base';
import {IVStackProps} from 'native-base/lib/typescript/components/primitives/Stack/VStack';
import {useCallback, useEffect, useState} from 'react';
import {Prayer, translatePrayer} from '@/adhan';
import {
  getAdhanSettingKey,
  useCalcSettingsHelper,
} from '@/store/calculation_settings';
import useDebounce from '@/utils/hooks/use_debounce';

type AdjustmentSettingProps = {
  prayer: Prayer;
};

export function AdjustmentSetting({
  prayer,
  ...hStackProps
}: AdjustmentSettingProps & IVStackProps) {
  const [adjustment, setAdjustment] = useCalcSettingsHelper(
    getAdhanSettingKey(prayer, 'adjustment'),
  );

  const [localAdjustment, setLocalAdjustment] = useState(adjustment as number);
  const debouncedAdjustment = useDebounce(localAdjustment, 500);

  const prayerName = translatePrayer(prayer);

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
    <VStack {...hStackProps}>
      <Text
        textAlign={'center'}
        numberOfLines={1}
        maxFontSizeMultiplier={1}
        minimumFontScale={1}
        fontSize={'xs'}>
        {prayerName}
      </Text>

      <Button variant="outline" onPress={increaseLocalAdjustmentByOne}>
        +
      </Button>
      <Input
        size="md"
        value={localAdjustment.toString()}
        onChangeText={setLocalAdjustmentHelper}
        textAlign={'center'}
      />
      <Button variant="outline" onPress={decreaseLocalAdjustmentByOne}>
        -
      </Button>
    </VStack>
  );
}
