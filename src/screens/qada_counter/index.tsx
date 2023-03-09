import {Box, Button, FlatList} from 'native-base';
import {useCallback, useState} from 'react';
import {ListRenderItemInfo} from 'react-native';
import {useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import {CounterView} from './counter_view';
import {EditCounterModal} from './edit_counter_modal';
import {AddIcon} from '@/assets/icons/material_icons/add';
import {Counter, counterStore} from '@/store/counter';

export function QadaCounter() {
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

  const {counters, decreaseCounter, increaseCounter, removeCounter} = useStore(
    counterStore,
    state => ({
      counters: state.counters,
      decreaseCounter: state.decreaseCounter,
      increaseCounter: state.increaseCounter,
      removeCounter: state.removeCounter,
    }),
    shallow,
  );

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<Counter>) => {
      return (
        <CounterView
          onEditPress={setCreatingCounter}
          counter={item}
          key={item.id}
          increaseCounter={increaseCounter}
          decreaseCounter={decreaseCounter}
        />
      );
    },
    [decreaseCounter, increaseCounter],
  );

  const onCounterChanged = useCallback((state: Counter) => {
    counterStore.getState().updateCounter(state.id, state);
  }, []);

  return (
    <Box safeArea flex={1}>
      <FlatList data={counters} renderItem={renderItem} p="2" />
      <Button
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
    </Box>
  );
}
