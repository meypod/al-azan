import {Text} from 'native-base';
import {PropsWithChildren} from 'react';

export function IntroItem({
  item,
}: {
  item: PropsWithChildren<{title: () => string}>;
}) {
  return (
    <>
      <Text py="3" textAlign="center" width="100%" fontSize="lg" mb="5">
        {item.title()}
      </Text>
      {item.children}
    </>
  );
}
