import {createIcon, IIconProps} from 'native-base';

export function MutedIcon({...props}: IIconProps) {
  const Icon = createIcon({
    viewBox: '0 0 24 24',
    d: 'M3 9h4l5-5v16l-5-5H3V9m13.59 3L14 9.41L15.41 8L18 10.59L20.59 8L22 9.41L19.41 12L22 14.59L20.59 16L18 13.41L15.41 16L14 14.59L16.59 12Z',
  });
  return <Icon {...props} />;
}
