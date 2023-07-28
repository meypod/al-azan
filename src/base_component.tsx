import {i18n} from '@lingui/core';
import {I18nProvider} from '@lingui/react';
import {ColorMode, extendTheme, NativeBaseProvider} from 'native-base';
import React, {useEffect} from 'react';
import {PixelRatio, Dimensions} from 'react-native';
import {setupNotifeeForegroundHandler} from '@/notifee';
import {settings} from '@/store/settings';
import {colors} from '@/theme/colors';
import {components} from '@/theme/components';

let width;
{
  const dimensions = Dimensions.get('screen');
  width = Math.min(dimensions.width, dimensions.height);
}

let pixelRatio = 1;
if (PixelRatio.get() >= 4) {
  pixelRatio = PixelRatio.get() * 0.25;
} else if (PixelRatio.get() >= 2) {
  pixelRatio = PixelRatio.get() * 0.5;
}

if (width < 420) {
  pixelRatio = pixelRatio * 0.85;
} else if (width >= 600 && width < 800) {
  pixelRatio = pixelRatio * 1.5;
  if (pixelRatio > 3) {
    pixelRatio = 3;
  }
} else if (width >= 800) {
  pixelRatio = pixelRatio * 1.55;
  if (pixelRatio > 4) {
    pixelRatio = 4;
  }
}

const extendedTheme = extendTheme({
  colors: colors,
  config: {
    useSystemColorMode: false,
    initialColorMode: 'dark',
  },
  components,
  fontSizes: {
    xxs: 10 * pixelRatio,
    xs: 12 * pixelRatio,
    sm: 14 * pixelRatio,
    md: 16 * pixelRatio,
    lg: 18 * pixelRatio,
    xl: 20 * pixelRatio,
    '2xl': 24 * pixelRatio,
    '3xl': 30 * pixelRatio,
    '4xl': 36 * pixelRatio,
    '5xl': 48 * pixelRatio,
    '6xl': 60 * pixelRatio,
    '7xl': 72 * pixelRatio,
    '8xl': 96 * pixelRatio,
    '9xl': 128 * pixelRatio,
  },
});

const config = {
  suppressColorAccessibilityWarning: true,
};

const colorCodeManager = {
  async get() {
    return settings.getState().computed.themeColor;
  },
  async set(value: ColorMode | 'default') {
    settings.getState().setSetting('THEME_COLOR', value);
  },
};

export function BaseComponent(
  ChildComponent: React.FunctionComponent<any>,
  args: any,
) {
  useEffect(() => {
    const unsubscribe = setupNotifeeForegroundHandler();

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <I18nProvider i18n={i18n}>
      <NativeBaseProvider
        theme={extendedTheme}
        config={config}
        colorModeManager={colorCodeManager}>
        <ChildComponent {...args} />
      </NativeBaseProvider>
    </I18nProvider>
  );
}
