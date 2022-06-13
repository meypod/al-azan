import {ScrollView, Text} from 'native-base';
import {PropsWithChildren} from 'react';

export default IntroItem;

export function IntroItem({item}: {item: PropsWithChildren<{title: string}>}) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      p="4">
      <Text py="3" textAlign="center" width="100%" fontSize="lg" mb="5">
        {item.title}
      </Text>
      {item.children}
    </ScrollView>
  );
}
