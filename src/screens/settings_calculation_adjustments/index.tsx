import {ScrollView} from 'native-base';
import {SafeArea} from '@/components/safe_area';
import {AdjustmentSettings} from '@/screens/settings_calculation/adjustment_settings';

export function CalculationAdjustmentsSettings() {
  return (
    <SafeArea>
      <ScrollView p="4">
        <AdjustmentSettings />
      </ScrollView>
    </SafeArea>
  );
}
