import {immer} from 'zustand/middleware/immer';
import {createStore} from 'zustand/vanilla';
import {addDays} from '@/utils/date';

type AppState = {
  date: Date;
  navigating: boolean;
  changeCurrentDate: (newDate: Date) => void;
  increaseCurrentDateByOne: () => void;
  decreaseCurrentDateByOne: () => void;
  updateCurrentDate: () => void;
  resetCurrentDate: () => void;
};

export const homeStore = createStore<AppState>()(
  immer(set => ({
    date: new Date(),
    navigating: false,
    changeCurrentDate: (newDate: Date) =>
      set(draft => {
        newDate.setHours(0, 0, 0, 0);
        draft.date = newDate;
        draft.navigating = true;
      }),
    increaseCurrentDateByOne: () =>
      set(draft => {
        draft.date = addDays(draft.date, 1);
        if (draft.date.toDateString() === new Date().toDateString()) {
          draft.navigating = false;
        } else {
          draft.navigating = true;
        }
      }),
    decreaseCurrentDateByOne: () =>
      set(draft => {
        draft.date = addDays(draft.date, -1);
        if (draft.date.toDateString() === new Date().toDateString()) {
          draft.navigating = false;
        } else {
          draft.navigating = true;
        }
      }),
    updateCurrentDate: () =>
      set(draft => {
        const now = new Date();
        let newDate = new Date(draft.date); // to update the current selected date
        if (!draft.navigating) {
          newDate = now;
        }
        draft.date = newDate;
      }),
    resetCurrentDate: () =>
      set(draft => {
        draft.date = new Date();
        draft.navigating = false;
      }),
  })),
);
