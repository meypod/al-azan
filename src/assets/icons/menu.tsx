import {createIcon, IIconProps} from 'native-base';

export function MenuIcon({...props}: IIconProps) {
  const Icon = createIcon({
    viewBox: '0 0 48 48',
    d: 'M5.8 36.35V32.95H42.2V36.35ZM5.8 25.7V22.3H42.2V25.7ZM5.8 15.05V11.65H42.2V15.05Z',
  });
  return <Icon {...props} />;
}
