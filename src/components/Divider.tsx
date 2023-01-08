import {Flex, Text, IBoxProps, Box} from 'native-base';
import {memo} from 'react';

function Divider({
  label,
  fontSize = 'sm',
  _text,
  children,
  ...boxProps
}: {label?: string} & IBoxProps) {
  return (
    <Box
      {...boxProps}
      flex={1}
      flexDirection="row"
      alignItems="center"
      flexWrap="nowrap">
      <Flex
        flex={1}
        flexShrink={1}
        borderBottomWidth={1}
        borderBottomColor="coolGray.300:alpha.50"
        _light={{
          borderBottomColor: 'coolGray.600:alpha.50',
        }}></Flex>
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
      <Flex
        flex={1}
        flexShrink={1}
        borderBottomWidth={1}
        borderBottomColor="coolGray.300:alpha.50"
        _light={{
          borderBottomColor: 'coolGray.600:alpha.50',
        }}></Flex>
    </Box>
  );
}

export default memo(Divider);
