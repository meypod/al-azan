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
  const {
    value,
    onChange,
    invalidLabel = '0',
    invalidValue = 0,
    ...otherProps
  } = props;
  const [tmpText, setTmpText] = useState<string>(
    (value || invalidLabel).toString(),
  );

  const onEndEditing = useCallback(
    (e: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
      const parsedValue = parseFloat(e.nativeEvent.text);
      if (!isNaN(parsedValue)) {
        setTmpText(parsedValue.toString());
        onChange && onChange(parsedValue);
      } else {
        setTmpText(invalidLabel);
        onChange && onChange(invalidValue);
      }
    },
    [invalidLabel, invalidValue, onChange],
  );

  useEffect(() => {
    if (typeof value === 'string') {
      onEndEditing({
        nativeEvent: {
          text: value,
        },
      } as NativeSyntheticEvent<TextInputEndEditingEventData>);
    } else {
      setTmpText((value || invalidLabel).toString());
    }
  }, [invalidLabel, onEndEditing, value]);

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
