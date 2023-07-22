import {Text, Stack, IStackProps} from 'native-base';
import {memo} from 'react';

function Divider({
  label,
  fontSize = 'sm',
  _text,
  children,
  ...stackProps
}: {label?: string} & IStackProps) {
  return (
    <Stack
      {...stackProps}
      flex={1}
      flexDirection="row"
      alignItems="center"
      flexWrap="nowrap">
      <Stack
        flex={1}
        flexShrink={1}
        borderBottomWidth={1}
        borderBottomColor="coolGray.300:alpha.50"
        _light={{
          borderBottomColor: 'coolGray.600:alpha.50',
        }}></Stack>
      <Text
        fontSize={fontSize}
        noOfLines={1}
        allowFontScaling={true}
        maxFontSizeMultiplier={1.5}
        flexShrink={0}
        mx="2"
        {..._text}>
        {label || children}
      </Text>
      <Stack
        flex={1}
        flexShrink={1}
        borderBottomWidth={1}
        borderBottomColor="coolGray.300:alpha.50"
        _light={{
          borderBottomColor: 'coolGray.600:alpha.50',
        }}></Stack>
    </Stack>
  );
}

export default memo(Divider);
