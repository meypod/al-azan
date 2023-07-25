import {createJSONStorage, persist} from 'zustand/middleware';
import {immer} from 'zustand/middleware/immer';
import {createStore} from 'zustand/vanilla';
import type {LocationDetail} from './calculation';
import {zustandStorage} from './mmkv';

export const FAVORITE_LOCATIONS_STORAGE_KEY = 'FAVORITE_LOCATIONS_STORAGE';

export type FavoriteLocation = {
  id: string;
} & LocationDetail;

export type FavoriteLocationsStore = {
  locations: Array<FavoriteLocation>;

  updateFavorite: (id: string, value: FavoriteLocation) => void;
  removeFavorite: (item: FavoriteLocation | string) => void;
  setFavorites: (locations: Array<FavoriteLocation>) => void;
};

const invalidKeys = ['updateFavorite', 'removeFavorite', 'setFavorites'];

export const favoriteLocationStore = createStore<FavoriteLocationsStore>()(
  persist(
    immer<FavoriteLocationsStore>(set => ({
      locations: [],

      // general
      updateFavorite: (id: string, val: FavoriteLocation) =>
        set(draft => {
          let fIndex = draft.locations.findIndex(e => e.id === id);
          if (fIndex !== -1) {
            draft.locations[fIndex] = val;
          } else {
            draft.locations.push(val);
          }
        }),
      removeFavorite: (item: FavoriteLocation | string) =>
        set(draft => {
          const id = (item as FavoriteLocation).id || item;
          let fIndex = draft.locations.findIndex(e => e.id === id);
          if (fIndex !== -1) {
            draft.locations.splice(fIndex, 1);
          }
        }),
      setFavorites: (locations: Array<FavoriteLocation>) =>
        set(draft => {
          draft.locations = locations;
        }),
    })),
    {
      name: FAVORITE_LOCATIONS_STORAGE_KEY,
      storage: createJSONStorage(() => zustandStorage),
      partialize: state =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !invalidKeys.includes(key)),
        ),
      version: 0,
      migrate: (persistedState, version) => {
        /* eslint-disable no-fallthrough */
        // fall through cases is exactly the use case for migration.
        switch (version) {
          case 0:
            // this will be run when storage version is changed to 1
            break;
        }
        /* eslint-enable no-fallthrough */
        return persistedState as FavoriteLocationsStore;
      },
    },
  ),
);
