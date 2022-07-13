import {produce} from 'immer';
import create from 'zustand';
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

export const useStore = create<AppState>()(set => ({
  date: new Date(),
  navigating: false,
  changeCurrentDate: (newDate: Date) =>
    set(
      produce(draft => {
        draft.date = newDate;
        draft.navigating = true;
      }),
    ),
  increaseCurrentDateByOne: () =>
    set(
      produce(draft => {
        draft.date = addDays(draft.date, 1);
        if (draft.date.toDateString() === new Date().toDateString()) {
          draft.navigating = false;
        } else {
          draft.navigating = true;
        }
      }),
    ),
  decreaseCurrentDateByOne: () =>
    set(
      produce(draft => {
        draft.date = addDays(draft.date, -1);
        if (draft.date.toDateString() === new Date().toDateString()) {
          draft.navigating = false;
        } else {
          draft.navigating = true;
        }
      }),
    ),
  updateCurrentDate: () =>
    set(
      produce(draft => {
        const now = new Date();
        let newDate = new Date(draft.date); // to update the current selected date
        if (!draft.navigating) {
          newDate = now;
        } else {
          newDate.setHours(now.getHours());
          newDate.setMinutes(now.getMinutes());
        }
        draft.date = newDate;
      }),
    ),
  resetCurrentDate: () =>
    set(
      produce(draft => {
        draft.date = new Date();
        draft.navigating = false;
      }),
    ),
}));
