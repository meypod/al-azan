import {t} from '@lingui/macro';
import {Text, ITextProps} from 'native-base';
import {ColorType} from 'native-base/lib/typescript/components/types';
import {memo} from 'react';
import {AccuracyLevel} from '@/modules/compass';

function AccuracyIndicator({
  accuracy,
  ...props
}: {accuracy: AccuracyLevel} & ITextProps) {
  let translatedAccuracy: string;
  let color: ColorType;
  if (accuracy < 0) {
    translatedAccuracy = t`Compass sensor unavailable`;
  }
  switch (accuracy) {
    case AccuracyLevel.SENSOR_STATUS_ACCURACY_LOW:
      translatedAccuracy = t`Low`;
      color = 'orange.600';
      break;
    case AccuracyLevel.SENSOR_STATUS_ACCURACY_MEDIUM:
      translatedAccuracy = t`Medium`;
      color = 'yellow.600';
      break;
    case AccuracyLevel.SENSOR_STATUS_ACCURACY_HIGH:
      translatedAccuracy = t`High`;
      color = 'green.600';
      break;
    default:
      translatedAccuracy = t`Unreliable`;
      color = 'red.600';
      break;
  }

  return (
    <Text {...props}>
      {t`Accuracy`}: <Text color={color}>{translatedAccuracy}</Text>
    </Text>
  );
}

export default memo(AccuracyIndicator);
