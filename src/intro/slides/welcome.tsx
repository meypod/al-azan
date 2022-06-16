import {t} from '@lingui/macro';
import {Box, Text} from 'native-base';
import {LanguageSettings} from '@/screens/settings/components/LanguageSettings';

export function WelcomeSlide() {
  return (
    <Box p="4">
      <Text>
        {t`Thanks for choosing this app! There are things you need to do before you
        can start using this app.`}
      </Text>
      <Text mb="5">{t`We'll help you do them quickly.`}</Text>

      <LanguageSettings />
    </Box>
  );
}
