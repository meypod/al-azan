import {IInputProps, Input} from 'native-base';
import {memo, useCallback, useEffect, useRef, useState} from 'react';

export const NumericInput = memo(function NumericInput(
  props: Omit<IInputProps, 'value' | 'onChange' | 'onChangeText'> & {
    value: number | string | undefined;
    onChange: (num: number) => void;
    /** the value that is returned when entered text is not a number */
    invalidValue?: any;
    /** the value that is shown when entered text is not a number */
    invalidLabel?: string;
    /** parse as integer? */
    int?: boolean;
    ignoreValueChange?: boolean;
  },
) {
  const {
    value,
    onChange,
    invalidValue = 0,
    invalidLabel = invalidValue.toString(),
    int = false,
    ignoreValueChange,
    ...otherProps
  } = props;
  const [tmpText, setTmpText] = useState<string>(
    (value || invalidLabel).toString(),
  );

  const parsedValue = useRef(
    int ? parseInt(value as string, 10) : parseFloat(value as string),
  );

  const onInputChange = useCallback(
    (text: string, dontEmit?: Boolean) => {
      const newValueInt = parseInt(text, 10);
      const newValueFloat = parseFloat(text);

      const newValue = int ? newValueInt : newValueFloat;

      if (
        newValue !== parsedValue.current ||
        (int && newValueInt !== newValueFloat)
      ) {
        parsedValue.current = newValue;
        if (!isNaN(newValue)) {
          setTmpText(newValue.toString());
          if (!dontEmit && onChange) {
            onChange(newValue);
          }
        } else {
          setTmpText(invalidLabel);
          if (!dontEmit && onChange) {
            onChange(invalidValue);
          }
        }
      } else {
        setTmpText(text);
      }
    },
    [int, invalidLabel, invalidValue, onChange],
  );

  useEffect(() => {
    // we just need loose equality here
    if (value != parsedValue.current) {
      onInputChange(value as string, true);
    }
  }, [ignoreValueChange, onInputChange, value]);

  return (
    <Input
      keyboardType="numeric"
      {...otherProps}
      onChangeText={onInputChange}
      value={tmpText}
    />
  );
});
