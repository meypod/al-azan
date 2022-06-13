import {createIcon, IIconProps} from 'native-base';

export function ArrowBackIcon({...props}: IIconProps) {
  const Icon = createIcon({
    viewBox: '0 0 48 48',
    d: 'M24 40 8 24 24 8 26.1 10.1 13.7 22.5H40V25.5H13.7L26.1 37.9Z',
  });
  return <Icon {...props} />;
}
