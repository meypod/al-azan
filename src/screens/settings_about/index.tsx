import {t} from '@lingui/macro';
import {
  ScrollView,
  IScrollViewProps,
  FormControl,
  Text,
  Divider,
} from 'native-base';
import {useCallback, useState} from 'react';
import {ToastAndroid} from 'react-native';
import pkg from '@/../package.json';
import {SafeArea} from '@/components/safe_area';
import {settings} from '@/store/settings';

export function AboutSettings(props: IScrollViewProps) {
  const [tCount, setTCount] = useState(0);

  const handleT = useCallback(() => {
    setTCount(tCount + 1);
    if (tCount === 5) {
      settings.setState({DEV_MODE: true});
      ToastAndroid.show('Dev Mode Enabled', ToastAndroid.SHORT);
    }
  }, [setTCount, tCount]);

  return (
    <SafeArea>
      <ScrollView p="4" _contentContainerStyle={{paddingBottom: 40}} {...props}>
        <FormControl mb="3">
          <FormControl.Label m="0" onTouchStart={handleT}>
            {t`Version`}:
          </FormControl.Label>
          <Text fontSize="lg">{pkg.version}</Text>
        </FormControl>
        <FormControl mb="3">
          <FormControl.Label m="0">{t`Home`}:</FormControl.Label>
          <Text dataDetectorType={'link'}>
            {pkg.repository.web + '/releases/tag/v' + pkg.version}
          </Text>
        </FormControl>
        <FormControl mb="3">
          <FormControl.Label m="0">{t`License`}:</FormControl.Label>
          <Text>AGPL-3.0</Text>
        </FormControl>
        <Divider my="3"></Divider>
        <FormControl mb="3">
          <Text>
            {t({
              id: 'about.credits',
              message: `All copyrights for adhan voices belong to their respective owners.
            Special thanks to translation.io (lingui.js) for their wonderful services.
            Thanks to all open source community members who made all these wonderful libraries that made making this app possible.`,
            })}
          </Text>
          <Text>
            {t({
              id: 'about.credits.google',
              message: `Most of icons used in this app are from google material icons.`,
            })}
          </Text>
        </FormControl>
      </ScrollView>
    </SafeArea>
  );
}
