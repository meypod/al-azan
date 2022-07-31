import {t} from '@lingui/macro';
import {ScrollView, IScrollViewProps, Input, FormControl} from 'native-base';
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
        <Input value={pkg.version} />
      </FormControl>
      <FormControl mb="3">
        <FormControl.Label m="0">{t`Home`}:</FormControl.Label>
        <Input
          textAlign={'left'}
          value={pkg.repository.web + '/releases/tag/' + pkg.version}
          dataDetectorTypes="link"
        />
      </FormControl>
    </ScrollView>
  );
}
