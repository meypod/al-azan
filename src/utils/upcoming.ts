import {t} from '@lingui/macro';
import {ToastAndroid} from 'react-native';
import {addDays, getDayName, getTime} from '@/utils/date';

export type UpcomingDateOptions = {
  /** the date of the upcoming thing */
  date: Date;
};

/** returns a formatted containing `${formatted_time}`, appends ` ${tomorrow_or_day_name}` if date is not today */
export function getUpcommingTimeDay(date: Date) {
  let str = getTime(date);
  if (date.toDateString() !== new Date().toDateString()) {
    if (date.toDateString() === addDays(new Date(), 1).toDateString()) {
      str += ' ' + t`Tomorrow`;
    } else {
      str += ' ' + getDayName(date);
    }
  }
  return str;
}

/** displays a toast of `{message} ${formatted_time_and_date}`. appends `${tomorrow_or_day_name}` if date is not today. */
export function showUpcomingToast(
  options: UpcomingDateOptions & {message: string},
) {
  const {message, date} = options || {};
  const formattedDate = getUpcommingTimeDay(date);
  let newMessage = `${message} ${formattedDate}`;
  ToastAndroid.show(newMessage, ToastAndroid.SHORT);
}
