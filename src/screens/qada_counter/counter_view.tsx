import {i18n, MessageDescriptor} from '@lingui/core';
import {defineMessage, t} from '@lingui/macro';
import {HStack, Text, VStack, Button} from 'native-base';
import {memo} from 'react';
import {TouchableNativeFeedback} from 'react-native';
import {ScaleDecorator} from 'react-native-draggable-flatlist';
import {translatePrayer} from '@/adhan';
import {Add400Icon} from '@/assets/icons/material_icons/add_400';
import {Minus400Icon} from '@/assets/icons/material_icons/minus_400';
import {isRTL} from '@/i18n';
import {Counter, CounterStore} from '@/store/counter';
import {formatNu, getDateDiff, getFormattedDateDiff} from '@/utils/date';

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
  historyVisible,
}: {
  counter: Counter;
  onEditPress: (reminderState: Counter) => void;
  drag: () => void;
  dragging: boolean;
  historyVisible?: boolean;
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
          accessibilityLabel={t`Decrement`}
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
          <VStack flex="1" alignItems="center">
            <Text fontSize="md">
              {counter.label ||
                translatePrayer(counter.id) ||
                translateCommonIds(counter.id) ||
                '-'}
            </Text>
            <Text fontSize="md">{formatNu(counter.count)}</Text>
            {historyVisible &&
              (counter.lastModified ? (
                <Text
                  fontSize="xs"
                  noOfLines={1}
                  style={{writingDirection: 'ltr'}}>
                  {getFormattedDateDiff(
                    getDateDiff(Date.now(), counter.lastModified),
                  )}
                  ,{' '}
                  {isRTL
                    ? formatNu(counter.count)
                    : formatNu(counter.lastCount!)}
                  <Text fontSize="lg">&rarr;</Text>
                  {isRTL
                    ? formatNu(counter.lastCount!)
                    : formatNu(counter.count)}
                </Text>
              ) : (
                <Text fontSize="xs" noOfLines={1}>
                  -
                </Text>
              ))}
          </VStack>
        </TouchableNativeFeedback>

        <Button
          accessibilityLabel={t`Increment`}
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
