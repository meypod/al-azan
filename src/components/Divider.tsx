import {Flex, Text, IBoxProps, Box} from 'native-base';
import {memo} from 'react';

function Divider({
  label,
  fontSize = 'sm',
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
        borderBottomColor="coolGray.300:alpha.20"
        _light={{
          borderBottomColor: 'coolGray.600:alpha.20',
        }}></Flex>
      {label && (
        <Text
          fontSize={fontSize}
          color="coolGray.400"
          _light={{
            color: 'coolGray.600',
          }}
          noOfLines={1}
          flexShrink={0}
          mx="2">
          {label}
        </Text>
      )}
      <Flex
        flex={1}
        flexShrink={1}
        borderBottomWidth={1}
        borderBottomColor="coolGray.300:alpha.20"
        _light={{
          borderBottomColor: 'coolGray.600:alpha.20',
        }}></Flex>
    </Box>
  );
}

export default memo(Divider);
