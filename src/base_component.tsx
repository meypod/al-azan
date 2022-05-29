import {I18nProvider} from '@lingui/react';
import {extendTheme, NativeBaseProvider} from 'native-base';
import React, {StrictMode, useEffect} from 'react';
import {i18n} from '@/i18n';
import {setupNotifeeForegroundHandler} from '@/notifee';
import {colors} from '@/theme/colors';

const extendedTheme = extendTheme({
  colors: colors,
  config: {
    useSystemColorMode: true,
  },
});

const config = {
  suppressColorAccessibilityWarning: true,
};

export function BaseComponent(ChildComponent: React.FunctionComponent) {
  useEffect(() => {
    const unsubscribe = setupNotifeeForegroundHandler();

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <StrictMode>
      <I18nProvider i18n={i18n}>
        <NativeBaseProvider theme={extendedTheme} config={config}>
          <ChildComponent />
        </NativeBaseProvider>
      </I18nProvider>
    </StrictMode>
  );
}
