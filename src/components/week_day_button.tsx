import {Button} from 'native-base';
import {useCallback, useState} from 'react';

type WeekDayButtonProps = {
  isActive?: boolean;
  onChanged?: (isActive: boolean) => void;
  label: string;
};

export function WeekDayButton(props: WeekDayButtonProps) {
  const [isActive, setIsActive] = useState(!!props.isActive);

  const setIsActiveProxy = useCallback(
    (isAct: boolean) => {
      setIsActive(isAct);
      typeof props.onChanged === 'function' && props.onChanged(isAct);
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
        backgroundColor: isActive ? 'primary.500:alpha.70' : 'black:alpha.5',
        _text: {color: isActive ? 'white' : 'black:alpha.70'},
      }}
      _dark={{
        backgroundColor: isActive ? 'primary.800' : 'black',
        _text: {color: 'white:alpha.90'},
      }}
      onPress={() => setIsActiveProxy(!isActive)}>
      {props.label}
    </Button>
  );
}
