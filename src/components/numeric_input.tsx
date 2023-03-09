import {IInputProps, Input} from 'native-base';
import {memo, useCallback, useEffect, useState} from 'react';
import {NativeSyntheticEvent, TextInputEndEditingEventData} from 'react-native';

function NumericInput(
  props: Omit<IInputProps, 'value' | 'onChange' | 'onChangeText'> & {
    value: number | string | undefined;
    onChange: (num: number) => void;
    /** the value that is returned when entered text is not a number */
    invalidValue?: any;
    /** the value that is shown when entered text is not a number */
    invalidLabel?: string;
  },
) {
  const {value, onChange, invalidLabel, invalidValue, ...otherProps} = props;
  const [tmpText, setTmpText] = useState<string>((value || '').toString());

  const onEndEditing = useCallback(
    (e: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
      const parsedValue = parseFloat(e.nativeEvent.text);
      if (!isNaN(parsedValue)) {
        setTmpText(parsedValue.toString());
        onChange && onChange(parsedValue);
      } else {
        setTmpText(invalidLabel || '0');
        onChange && onChange(invalidValue || 0);
      }
    },
    [invalidLabel, invalidValue, onChange],
  );

  useEffect(() => {
    onEndEditing({
      nativeEvent: {
        text: (value || '').toString(),
      },
    } as NativeSyntheticEvent<TextInputEndEditingEventData>);
  }, [onEndEditing, value]);

  return (
    <Input
      {...otherProps}
      keyboardType="number-pad"
      onEndEditing={onEndEditing}
      onChangeText={setTmpText}
      value={tmpText}
    />
  );
}

export default memo(NumericInput);
