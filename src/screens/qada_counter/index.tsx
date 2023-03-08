import {Box, FlatList} from 'native-base';
import {useCallback} from 'react';
import {ListRenderItemInfo} from 'react-native';
import {useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import {CounterView} from './counter_view';
import {Counter, counterStore} from '@/store/counter';

export function QadaCounter() {
  const {counters, updateCounter} = useStore(
    counterStore,
    state => ({
      counters: state.counters,
      updateCounter: state.updateCounter,
      removeCounter: state.removeCounter,
    }),
    shallow,
  );

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<Counter>) => {
      return (
        <CounterView
          counter={item}
          key={item.id}
          updateCounter={updateCounter}
        />
      );
    },
    [updateCounter],
  );

  return (
    <Box safeArea>
      <FlatList data={counters} renderItem={renderItem} p="2" />
    </Box>
  );
}
