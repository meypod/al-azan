import {Text, ITextProps} from 'native-base';

export function StepLabel({label, ...textProps}: ITextProps & {label: string}) {
  return (
    <Text p="2" {...textProps}>
      {label}
    </Text>
  );
}
