import {i18n, MessageDescriptor} from '@lingui/core';
import {defineMessage} from '@lingui/macro';
import {HStack, Text, VStack, Button} from 'native-base';
import {memo, useCallback} from 'react';
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

function translateCommonIds(counterId: string) {
  if (counterId in commonIdsTranslation) {
    return i18n._(commonIdsTranslation[counterId]);
  }
  return '';
}

export function CounterView({
  counter,
  updateCounter,
}: {counter: Counter} & Pick<CounterStore, 'updateCounter'>) {
  const onDecrease = useCallback(() => {
    updateCounter(counter.id, {
      ...counter,
      count: counter.count - 1,
    });
  }, [counter, updateCounter]);
  const onIncrease = useCallback(() => {
    updateCounter(counter.id, {
      ...counter,
      count: counter.count + 1,
    });
  }, [counter, updateCounter]);

  // todo: translate default counters
  return (
    <HStack
      p="0"
      justifyContent="space-between"
      alignItems="center"
      mb="2"
      bgColor="gray.400:alpha.50"
      _dark={{
        bgColor: 'gray.800',
      }}
      borderRadius={4}>
      <Button
        height="100%"
        onPress={onDecrease}
        variant="ghost"
        borderRightWidth={3}
        borderColor="gray.100"
        _dark={{
          borderColor: 'gray.900',
        }}
        borderRadius={0}>
        <Minus400Icon color="gray.900" _dark={{color: 'gray.400'}} size="2xl" />
      </Button>
      <VStack>
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
      <Button
        height="100%"
        onPress={onIncrease}
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
  );
}

export default memo(CounterView);
