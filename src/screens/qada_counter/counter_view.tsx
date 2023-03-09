import {i18n, MessageDescriptor} from '@lingui/core';
import {defineMessage} from '@lingui/macro';
import {HStack, Text, VStack, Button} from 'native-base';
import {memo} from 'react';
import {TouchableNativeFeedback} from 'react-native';
import {ScaleDecorator} from 'react-native-draggable-flatlist';
import {translatePrayer} from '@/adhan';
import {Add400Icon} from '@/assets/icons/material_icons/add_400';
import {Minus400Icon} from '@/assets/icons/material_icons/minus_400';
import {Counter, CounterStore} from '@/store/counter';

const commonIdsTranslation = {
  fast: defineMessage({
    id: 'counter.fast',
    message: 'Fast',
    comment: 'in religious context',
  }),
} as Record<string, MessageDescriptor>;

export function translateCommonIds(counterId: string) {
  if (counterId in commonIdsTranslation) {
    return i18n._(commonIdsTranslation[counterId]);
  }
  return '';
}

export function CounterView({
  counter,
  increaseCounter,
  decreaseCounter,
  onEditPress,
  drag,
  dragging,
}: {
  counter: Counter;
  onEditPress: (reminderState: Counter) => void;
  drag: () => void;
  dragging: boolean;
} & Pick<CounterStore, 'increaseCounter' | 'decreaseCounter'>) {
  return (
    <ScaleDecorator activeScale={1.05}>
      <HStack
        p="0"
        justifyContent="space-between"
        alignItems="center"
        mb="2"
        bgColor={dragging ? 'gray.300' : 'gray.400:alpha.50'}
        _dark={{
          bgColor: dragging ? 'gray.800:alpha.90' : 'gray.800',
        }}
        borderRadius={4}>
        <Button
          height="100%"
          onPress={decreaseCounter.bind(null, counter.id)}
          variant="ghost"
          borderRightWidth={3}
          borderColor="gray.100"
          _dark={{
            borderColor: 'gray.900',
          }}
          borderRadius={0}>
          <Minus400Icon
            color="gray.900"
            _dark={{color: 'gray.400'}}
            size="2xl"
          />
        </Button>
        <TouchableNativeFeedback
          onPress={onEditPress.bind(null, counter)}
          onLongPress={drag}>
          <VStack flex="1">
            <Text fontSize="lg" textAlign="center">
              {counter.label ||
                translatePrayer(counter.id) ||
                translateCommonIds(counter.id) ||
                '-'}
            </Text>
            <Text fontSize="lg" textAlign="center">
              {counter.count}
            </Text>
          </VStack>
        </TouchableNativeFeedback>

        <Button
          height="100%"
          onPress={increaseCounter.bind(null, counter.id)}
          variant="ghost"
          borderLeftWidth={3}
          borderColor="gray.100"
          _dark={{
            borderColor: 'gray.900',
          }}
          borderRadius={0}>
          <Add400Icon color="gray.900" _dark={{color: 'gray.400'}} size="2xl" />
        </Button>
      </HStack>
    </ScaleDecorator>
  );
}

export default memo(CounterView);
