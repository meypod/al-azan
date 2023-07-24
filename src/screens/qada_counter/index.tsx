import {t} from '@lingui/macro';
import {Stack, Button} from 'native-base';
import {useCallback, useState} from 'react';
import DraggableFlatList, {RenderItem} from 'react-native-draggable-flatlist';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import {CounterView} from './counter_view';
import {EditCounterModal} from './edit_counter_modal';
import {AddIcon} from '@/assets/icons/material_icons/add';
import {SafeArea} from '@/components/safe_area';
import {Counter, counterStore} from '@/store/counter';
import {useSettings} from '@/store/settings';

export function QadaCounter() {
  const [historyVisible] = useSettings('COUNTER_HISTORY_VISIBLE');
  const [creatingCounter, setCreatingCounter] =
    useState<Partial<Counter> | null>(null);

  const cancelCounterCreation = () => {
    // clear modal
    setCreatingCounter(null);
  };

  const onAddCounterPressed = () => {
    // reset and show new counter modal
    setCreatingCounter({});
  };

  const {
    counters,
    setCounters,
    decreaseCounter,
    increaseCounter,
    removeCounter,
  } = useStore(
    counterStore,
    state => ({
      counters: state.counters,
      setCounters: state.setCounters,
      decreaseCounter: state.decreaseCounter,
      increaseCounter: state.increaseCounter,
      removeCounter: state.removeCounter,
    }),
    shallow,
  );

  const renderItem: RenderItem<Counter> = useCallback(
    ({item, drag, isActive}) => {
      return (
        <CounterView
          drag={drag}
          dragging={isActive}
          onEditPress={setCreatingCounter}
          counter={item}
          key={item.id}
          increaseCounter={increaseCounter}
          decreaseCounter={decreaseCounter}
          historyVisible={historyVisible}
        />
      );
    },
    [decreaseCounter, historyVisible, increaseCounter],
  );

  const onCounterChanged = useCallback((state: Counter) => {
    counterStore.getState().updateCounter(state.id, state);
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeArea>
        <Stack flex={1}>
          <DraggableFlatList
            data={counters}
            onDragEnd={({data}) => setCounters(data)}
            renderItem={renderItem as RenderItem<unknown>}
            keyExtractor={counter => counter.id}
            contentContainerStyle={{
              paddingBottom: 80,
            }}
            style={{
              padding: 8,
            }}
          />
          <Button
            accessibilityLabel={t`Add new counter`}
            bgColor="primary.600"
            _dark={{
              bgColor: 'coolGray.700',
            }}
            _pressed={{
              bgColor: 'primary.700',
              _dark: {
                bgColor: 'coolGray.800',
              },
            }}
            position="absolute"
            right={2}
            bottom={2}
            height={16}
            width={16}
            shadow="2"
            borderRadius={1000}
            onPress={onAddCounterPressed}>
            <AddIcon size="2xl" color="gray.100" _dark={{color: 'gray.400'}} />
          </Button>
          <EditCounterModal
            counterState={creatingCounter}
            onCancel={cancelCounterCreation}
            onConfirm={onCounterChanged}
            onDelete={removeCounter}
          />
        </Stack>
      </SafeArea>
    </GestureHandlerRootView>
  );
}
