import {produce} from 'immer';
import create from 'zustand';
import {addDays} from '@/utils/date';

type AppState = {
  date: Date;
  changeCurrentDate: (newDate: Date) => void;
  increaseCurrentDateByOne: () => void;
  decreaseCurrentDateByOne: () => void;
  updateCurrentDate: () => void;
  resetCurrentDate: () => void;
};

export const useStore = create<AppState>()(set => ({
  date: new Date(),
  changeCurrentDate: (newDate: Date) =>
    set(
      produce(draft => {
        draft.date = newDate;
      }),
    ),
  increaseCurrentDateByOne: () =>
    set(
      produce(draft => {
        draft.date = addDays(draft.date, 1);
      }),
    ),
  decreaseCurrentDateByOne: () =>
    set(
      produce(draft => {
        draft.date = addDays(draft.date, -1);
      }),
    ),
  updateCurrentDate: () =>
    set(
      produce(draft => {
        const now = new Date();
        const newDate = new Date(draft.date);
        newDate.setHours(now.getHours());
        newDate.setMinutes(now.getMinutes());
        draft.date = newDate;
      }),
    ),
  resetCurrentDate: () =>
    set(
      produce(draft => {
        draft.date = new Date();
      }),
    ),
}));
