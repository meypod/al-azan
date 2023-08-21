import {immer} from 'zustand/middleware/immer';
import {createStore} from 'zustand/vanilla';
import {addDays} from '@/utils/date';

type AppState = {
  date: Date;
  isNotToday: boolean;
  changeCurrentDate: (newDate: Date) => void;
  increaseCurrentDateByOne: () => void;
  decreaseCurrentDateByOne: () => void;
  resetCurrentDate: () => void;
};

function isNotToday(date: Date) {
  return !(date.toDateString() === new Date().toDateString());
}

export const homeStore = createStore<AppState>()(
  immer<AppState>(set => ({
    date: new Date(),
    isNotToday: false,
    changeCurrentDate: (newDate: Date) =>
      set(draft => {
        newDate.setHours(0, 0, 0, 0);
        draft.date = newDate;
        draft.isNotToday = isNotToday(draft.date);
      }),
    increaseCurrentDateByOne: () =>
      set(draft => {
        draft.date = addDays(draft.date, 1);
        draft.isNotToday = isNotToday(draft.date);
      }),
    decreaseCurrentDateByOne: () =>
      set(draft => {
        draft.date = addDays(draft.date, -1);
        draft.isNotToday = isNotToday(draft.date);
      }),
    resetCurrentDate: () =>
      set(draft => {
        draft.date = new Date();
        draft.isNotToday = isNotToday(draft.date);
      }),
  })),
);
