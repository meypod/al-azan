import {t} from '@lingui/macro';
import {Box, Button, HStack, Text} from 'native-base';
import {useCallback} from 'react';
import {navigate} from '@/navigation/root_navigation';
import {useSettings} from '@/store/settings';

export function QiblaFinder() {
  const [understood, setUnderstood] = useSettings('QIBLA_FINDER_UNDERSTOOD');

  const onUnderstood = useCallback(() => {
    setUnderstood(true);
  }, [setUnderstood]);

  return (
    <Box safeArea p="3">
      <Text textAlign="center" fontSize="xl">
        {t`Disclaimer`}
      </Text>
      <Text mb="8" textAlign="justify">
        {t`Note that due to software and hardware errors, Qibla direction shown by this app, particularly in compass mode, can be wrong.`}
      </Text>
      {understood ? (
        <HStack justifyContent="space-around">
          <Button onPress={() => navigate('QiblaMap')}>{t`Use Map`}</Button>
          <Button
            onPress={() => navigate('QiblaCompass')}>{t`Use Compass`}</Button>
        </HStack>
      ) : (
        <Button onPress={onUnderstood}>{t`I Understand`}</Button>
      )}
    </Box>
  );
}
