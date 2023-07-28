import {immer} from 'zustand/middleware/immer';
import {createStore} from 'zustand/vanilla';
import {settings} from './settings';
import {addMonths, getYearAndMonth} from '@/utils/date';

type AppState = {
  date: Date;
  navigating: boolean;
  changeCurrentDate: (newDate: Date) => void;
  increaseCurrentDateByOneMonth: () => void;
  decreaseCurrentDateByOneMonth: () => void;
  updateCurrentDate: () => void;
  resetCurrentDate: () => void;
};

export const monthlyViewStore = createStore<AppState>()(
  immer<AppState>(set => ({
    date: new Date(),
    navigating: false,
    isHijri: false,
    changeCurrentDate: (newDate: Date) =>
      set(draft => {
        newDate.setHours(0, 0, 0, 0);
        draft.date = newDate;
        draft.navigating = true;
      }),
    increaseCurrentDateByOneMonth: () =>
      set(draft => {
        const isHijri = settings.getState().HIJRI_MONTHLY_VIEW;
        draft.date = addMonths(draft.date, 1, isHijri);
        if (
          getYearAndMonth(draft.date, isHijri) ===
          getYearAndMonth(new Date(), isHijri)
        ) {
          draft.navigating = false;
        } else {
          draft.navigating = true;
        }
      }),
    decreaseCurrentDateByOneMonth: () =>
      set(draft => {
        const isHijri = settings.getState().HIJRI_MONTHLY_VIEW;
        draft.date = addMonths(draft.date, -1, isHijri);
        if (
          getYearAndMonth(draft.date, isHijri) ===
          getYearAndMonth(new Date(), isHijri)
        ) {
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
