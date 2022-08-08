import {t} from '@lingui/macro';
import {ScrollView, IScrollViewProps, FormControl, Text} from 'native-base';
import pkg from '@/../package.json';

export function AboutSettings(props: IScrollViewProps) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      p="4"
      _contentContainerStyle={{paddingBottom: 40}}
      {...props}>
      <FormControl mb="3">
        <FormControl.Label m="0">{t`Version`}:</FormControl.Label>
        <Text fontSize="lg">{pkg.version}</Text>
      </FormControl>
      <FormControl mb="3">
        <FormControl.Label m="0">{t`Home`}:</FormControl.Label>
        <Text dataDetectorType={'link'}>
          {pkg.repository.web + '/releases/tag/' + pkg.version}
        </Text>
      </FormControl>
      <FormControl mb="3">
        <FormControl.Label m="0">{t`License`}:</FormControl.Label>
        <Text>AGPL-3.0</Text>
      </FormControl>
      <FormControl mb="3">
        <FormControl.Label m="0">{t`Credits`}:</FormControl.Label>
        <Text>{t`All credits for Adhan voices goes to their respective owners.
         Special thanks to translation.io (lingui.js) for their wonderful services.
         Thanks to all open source community members who made all these wonderful libraries that made making this app possible.`}</Text>
      </FormControl>
    </ScrollView>
  );
}
