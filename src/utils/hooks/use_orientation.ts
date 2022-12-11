import {useState, useEffect} from 'react';
import {Dimensions} from 'react-native';

/**
 * Returns true if the screen is in portrait mode
 */
const isPortrait = () => {
  const dim = Dimensions.get('screen');
  return dim.height >= dim.width;
};

/**
 * returns true if orientation is what passed in
 */
export function useOrientation(
  targetOrientation: 'portrait' | 'landscape' = 'portrait',
) {
  const [isTargetOrientation, setIsTargetOrientation] = useState(
    targetOrientation === 'portrait' ? isPortrait() : !isPortrait(),
  );

  useEffect(() => {
    // Event Listener for orientation changes
    const sub = Dimensions.addEventListener('change', () => {
      setIsTargetOrientation(
        targetOrientation === 'portrait' ? isPortrait() : !isPortrait(),
      );
    });

    return () => {
      sub.remove();
    };
  }, [targetOrientation, setIsTargetOrientation]);

  return isTargetOrientation;
}
