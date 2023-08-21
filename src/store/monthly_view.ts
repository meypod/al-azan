import {immer} from 'zustand/middleware/immer';
import {createStore} from 'zustand/vanilla';
import {settings} from './settings';
import {addMonths, getYearAndMonth} from '@/utils/date';

type AppState = {
  date: Date;
  isNotThisMonth: boolean;
  changeCurrentDate: (newDate: Date) => void;
  increaseCurrentDateByOneMonth: () => void;
  decreaseCurrentDateByOneMonth: () => void;
  resetCurrentDate: () => void;
};

function isNotThisMonth(date: Date, isHijri: boolean) {
  return !(
    getYearAndMonth(date, isHijri) === getYearAndMonth(new Date(), isHijri)
  );
}

export const monthlyViewStore = createStore<AppState>()(
  immer<AppState>(set => ({
    date: new Date(),
    isNotThisMonth: false,
    isHijri: false,
    changeCurrentDate: (newDate: Date) =>
      set(draft => {
        const isHijri = settings.getState().HIJRI_MONTHLY_VIEW;
        newDate.setHours(0, 0, 0, 0);
        draft.date = newDate;
        draft.isNotThisMonth = isNotThisMonth(draft.date, isHijri);
      }),
    increaseCurrentDateByOneMonth: () =>
      set(draft => {
        const isHijri = settings.getState().HIJRI_MONTHLY_VIEW;
        draft.date = addMonths(draft.date, 1, isHijri);
        draft.isNotThisMonth = isNotThisMonth(draft.date, isHijri);
      }),
    decreaseCurrentDateByOneMonth: () =>
      set(draft => {
        const isHijri = settings.getState().HIJRI_MONTHLY_VIEW;
        draft.date = addMonths(draft.date, -1, isHijri);
        draft.isNotThisMonth = isNotThisMonth(draft.date, isHijri);
      }),
    resetCurrentDate: () =>
      set(draft => {
        const isHijri = settings.getState().HIJRI_MONTHLY_VIEW;
        draft.date = new Date();
        draft.isNotThisMonth = isNotThisMonth(draft.date, isHijri);
      }),
  })),
);
