import {createIcon, IIconProps} from 'native-base';

export function ArrowForwardIcon({...props}: IIconProps) {
  const Icon = createIcon({
    viewBox: '0 0 48 48',
    d: 'M24 40 21.9 37.85 34.25 25.5H8V22.5H34.25L21.9 10.15L24 8L40 24Z',
  });
  return <Icon {...props} />;
}
