import {Button} from 'native-base';
import {useCallback, useState} from 'react';
import {WeekDayIndex} from '@/utils/date';

type WeekDayButtonProps = {
  dayIndex: WeekDayIndex;
  isActive?: boolean;
  onChanged?: (isActive: boolean, dayIndex: WeekDayIndex) => void;
  label: string;
  /** color scheme when button is active, defaults to 'primary' */
  colorScheme?: string;
};

export function WeekDayButton(props: WeekDayButtonProps) {
  const [isActive, setIsActive] = useState(!!props.isActive);
  const [colorScheme] = useState(props.colorScheme || 'primary');

  const setIsActiveProxy = useCallback(
    (isAct: boolean) => {
      setIsActive(isAct);
      typeof props.onChanged === 'function' &&
        props.onChanged(isAct, props.dayIndex);
    },
    [setIsActive, props],
  );

  return (
    <Button
      mr="1.5"
      mb="1.5"
      padding="1"
      variant="unstyled"
      _text={{noOfLines: 1, fontSize: 'xs'}}
      _light={{
        backgroundColor: isActive ? colorScheme + '.500' : 'black:alpha.5',
        _text: {color: isActive ? 'white' : 'black:alpha.70'},
      }}
      _dark={{
        backgroundColor: isActive ? colorScheme + '.800' : 'black',
        _text: {color: 'white:alpha.90'},
      }}
      onPress={() => setIsActiveProxy(!isActive)}>
      {props.label}
    </Button>
  );
}
