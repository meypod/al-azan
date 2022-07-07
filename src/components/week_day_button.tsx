import {Button} from 'native-base';
import {useState} from 'react';

type WeekDayButtonProps = {
  isActive?: boolean;
  onChanged?: (isActive: boolean) => void;
  label: string;
};

export function WeekDayButton(props: WeekDayButtonProps) {
  const [isActive, setIsActive] = useState(!!props.isActive);

  const setIsActiveProxy = (isAct: boolean) => {
    setIsActive(isAct);
    typeof props.onChanged === 'function' && props.onChanged(isAct);
  };

  return (
    <Button
      mx="2"
      mt="2"
      height={'12'}
      width={'12'}
      padding="0"
      borderRadius={'full'}
      variant="outline"
      _text={{noOfLines: 1, fontSize: 'xs', allowFontScaling: false}}
      _light={{
        backgroundColor: isActive ? 'primary.600:alpha.70' : 'white:alpha.70',
        borderColor: isActive
          ? 'primary.600:alpha.70'
          : 'coolGray.800:alpha.70',
        _text: {color: isActive ? 'white' : 'black:alpha.70'},
      }}
      _dark={{
        backgroundColor: isActive ? 'white:alpha.80' : 'black:alpha.15',
        borderColor: 'white:alpha.80',
        _text: {color: isActive ? 'black:alpha.80' : 'white:alpha.70'},
      }}
      onPress={() => setIsActiveProxy(!isActive)}>
      {props.label}
    </Button>
  );
}
