import {t} from '@lingui/macro';
import {Stack, Button, View, Text} from 'native-base';
import {useCallback, useState} from 'react';
import DraggableFlatList, {RenderItem} from 'react-native-draggable-flatlist';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import {useSettingsMonitor} from '../settings/use_settings_monitor';
import {EditFavoriteLocationModal} from './edit_favorite_location_modal';
import {FavoriteLocationListItemView} from './favorite_location_list_item_view';
import {AddIcon} from '@/assets/icons/material_icons/add';
import {SafeArea} from '@/components/safe_area';
import {useCalcSettings} from '@/store/calculation';
import {
  favoriteLocationStore,
  FavoriteLocation,
} from '@/store/favorite_locations';
import {showDeleteDialog} from '@/utils/dialogs';
import {getLocationLabel} from '@/utils/location';

export function FavoriteLocations() {
  useSettingsMonitor();

  const [creatingLocation, setCreatingLocation] =
    useState<Partial<FavoriteLocation> | null>(null);

  const cancelCityCreation = () => {
    // clear modal
    setCreatingLocation(null);
  };

  const onAddCityPressed = () => {
    // reset and show new counter modal
    setCreatingLocation({});
  };

  const {favorites, removeFavorite, setFavorites, updateFavorite} = useStore(
    favoriteLocationStore,
    state => ({
      favorites: state.locations,
      removeFavorite: state.removeFavorite,
      updateFavorite: state.updateFavorite,
      setFavorites: state.setFavorites,
    }),
    shallow,
  );

  const [selectedLocation, setSelectedLocation] = useCalcSettings('LOCATION');

  const onDeletePress = useCallback(
    (location: FavoriteLocation) => {
      showDeleteDialog(getLocationLabel(location)).then(agreed => {
        if (agreed && location.id) {
          removeFavorite(location);
        }
      });
    },
    [removeFavorite],
  );

  const renderItem: RenderItem<FavoriteLocation> = useCallback(
    ({item, drag, isActive}) => {
      return (
        <FavoriteLocationListItemView
          drag={drag}
          dragging={isActive}
          onEditPress={setCreatingLocation}
          onDeletePress={onDeletePress}
          onPress={setSelectedLocation}
          selectedItem={selectedLocation as FavoriteLocation}
          item={item}
          key={item.id}
        />
      );
    },
    [onDeletePress, selectedLocation, setSelectedLocation],
  );
  const onCounterChanged = useCallback(
    (state: FavoriteLocation) => {
      updateFavorite(state.id, state);
      if (
        selectedLocation &&
        (selectedLocation as FavoriteLocation).id === state.id
      ) {
        setSelectedLocation(state);
      }
    },
    [selectedLocation, setSelectedLocation, updateFavorite],
  );

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeArea>
        <Stack flex={1}>
          <DraggableFlatList
            data={favorites}
            onDragEnd={({data}) => setFavorites(data)}
            renderItem={renderItem as RenderItem<unknown>}
            keyExtractor={item => item.id}
            contentContainerStyle={{
              padding: 10,
              paddingBottom: 80,
            }}
            ListEmptyComponent={
              <View
                p="3"
                justifyContent="center"
                alignItems="center"
                height="20">
                <Text
                  fontSize="lg"
                  color="muted.500"
                  _dark={{color: 'muted.400'}}>{t`List is empty`}</Text>
              </View>
            }
          />
          <Button
            accessibilityLabel={t`Add new location`}
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
            onPress={onAddCityPressed}>
            <AddIcon size="2xl" color="gray.100" _dark={{color: 'gray.400'}} />
          </Button>
          <EditFavoriteLocationModal
            state={creatingLocation}
            onCancel={cancelCityCreation}
            onConfirm={onCounterChanged}
          />
        </Stack>
      </SafeArea>
    </GestureHandlerRootView>
  );
}
