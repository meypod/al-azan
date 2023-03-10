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
    /** parse as integer? */
    int?: boolean;
    /** should the input striction be immediate? */
    strict?: boolean;
  },
) {
  const {
    value,
    onChange,
    invalidLabel = '0',
    invalidValue = 0,
    int = false,
    strict = false,
    ...otherProps
  } = props;
  const [tmpText, setTmpText] = useState<string>(
    (value || invalidLabel).toString(),
  );

  const onEndEditing = useCallback(
    (e: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
      const parsedValue = int
        ? parseInt(e.nativeEvent.text, 10)
        : parseFloat(e.nativeEvent.text);
      if (!isNaN(parsedValue)) {
        setTmpText(parsedValue.toString());
        onChange && onChange(parsedValue);
      } else {
        setTmpText(invalidLabel);
        onChange && onChange(invalidValue);
      }
    },
    [int, invalidLabel, invalidValue, onChange],
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

  if (strict) {
    return (
      <Input
        {...otherProps}
        keyboardType="number-pad"
        onChange={onEndEditing}
        onChangeText={setTmpText}
        value={tmpText}
      />
    );
  } else {
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
}

export default memo(NumericInput);
