import {t} from '@lingui/macro';
import {Button, IButtonProps, IIconProps} from 'native-base';
import {useCallback, useEffect} from 'react';
import Orientation, {OrientationType} from 'react-native-orientation-locker';
import {ScreenLockLandscape} from '@/assets/icons/material_icons/screen_lock_landscape';
import {ScreenLockPortrait} from '@/assets/icons/material_icons/screen_lock_portrait';
import {ScreenRotationIcon} from '@/assets/icons/material_icons/screen_rotation';
import {useSettings} from '@/store/settings';
import {useOrientation} from '@/utils/hooks/use_orientation';

export function OrientationLock(props: IButtonProps & IIconProps) {
  const {size, ...otherProps} = props;
  const [orientationLocked, setOrientationLocked] = useSettings(
    'QIBLA_FINDER_ORIENTATION_LOCKED',
  );

  const isPortrait = useOrientation('portrait');

  const orientationLockToggle = useCallback(() => {
    setOrientationLocked(!orientationLocked);
  }, [orientationLocked, setOrientationLocked]);

  useEffect(() => {
    if (orientationLocked) {
      Orientation.getOrientation(o => {
        if (
          o === OrientationType['LANDSCAPE-LEFT'] ||
          o === OrientationType['LANDSCAPE-RIGHT']
        ) {
          Orientation.lockToLandscape();
        } else {
          Orientation.lockToPortrait();
        }
      });
    } else {
      Orientation.unlockAllOrientations();
    }

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, [orientationLocked]);

  return (
    <Button {...otherProps} onPress={orientationLockToggle} variant="ghost">
      {orientationLocked ? (
        isPortrait ? (
          <ScreenLockPortrait
            size={size}
            accessibilityLabel={t`Orientation Lock: Portrait`}
          />
        ) : (
          <ScreenLockLandscape
            size={size}
            accessibilityLabel={t`Orientation Lock: Landscape`}
          />
        )
      ) : (
        <ScreenRotationIcon
          size={size}
          accessibilityLabel={t`Orientation: Unlocked`}
        />
      )}
    </Button>
  );
}
