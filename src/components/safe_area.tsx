import {forwardRef} from 'react';
import {StyleSheet} from 'react-native';
import {
  NativeSafeAreaViewInstance,
  SafeAreaViewProps,
  SafeAreaView,
} from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

export const SafeArea = forwardRef<
  NativeSafeAreaViewInstance,
  SafeAreaViewProps
>(function SafeArea(props, ref) {
  return <SafeAreaView style={styles.fill} {...props} ref={ref} />;
});
