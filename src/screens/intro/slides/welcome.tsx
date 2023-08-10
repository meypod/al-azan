import {t} from '@lingui/macro';
import {Stack, Text} from 'native-base';
import {ImportSettings} from '@/screens/settings_backup/import_settings';
import {LanguageSettings} from '@/screens/settings_display/language_settings';

export function WelcomeSlide() {
  return (
    <Stack p="4">
      <Text>
        {t`Thanks for choosing this app! There are things you need to do before you can start using this app.`}
      </Text>
      <Text mb="5">{t`We'll help you do them quickly.`}</Text>

      <LanguageSettings mb="10" />

      <Text mb="1">{t`Or if you have a backup, you can import it`}:</Text>
      <ImportSettings />
    </Stack>
  );
}
