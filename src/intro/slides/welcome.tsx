import {t} from '@lingui/macro';
import {Text} from 'native-base';

export function WelcomeSlide() {
  return (
    <>
      <Text>
        {t`Thanks for choosing this app! There are things you need to do before you
        can start using this app.`}
      </Text>
      <Text>{t`We'll help you do them quickly.`}</Text>
    </>
  );
}
