import {Flex, Text, IBoxProps, Box} from 'native-base';
import {memo} from 'react';

function Divider({label, ...boxProps}: {label?: string} & IBoxProps) {
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
        borderBottomColor="coolGray.300:alpha.20"></Flex>
      {label && (
        <Text color="coolGray.400" adjustsFontSizeToFit noOfLines={1} mx="2">
          {label}
        </Text>
      )}
      <Flex
        flex={1}
        flexShrink={1}
        borderBottomWidth={1}
        borderBottomColor="coolGray.300:alpha.20"></Flex>
    </Box>
  );
}

export default memo(Divider);
