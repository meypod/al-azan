import {MessageDescriptor, i18n} from '@lingui/core';
import {t, defineMessage} from '@lingui/macro';

import {Flex, FormControl, IFlexProps} from 'native-base';
import {useState} from 'react';
import {WeekDayButton} from '@/components/week_day_button';
import {WeekDay} from '@/store/settings';

export const WeekDaysShortInOrder = {
  sun: defineMessage({
    message: 'SUN',
    comment: 'short week day, sunday',
  }),
  mon: defineMessage({
    message: 'MON',
    comment: 'short week day, monday',
  }),
  tue: defineMessage({
    message: 'TUE',
    comment: 'short week day, tuesday',
  }),
  wed: defineMessage({
    message: 'WED',
    comment: 'short week day, wednesday',
  }),
  thu: defineMessage({
    message: 'THU',
    comment: 'short week day, thursday',
  }),
  fri: defineMessage({
    message: 'FRI',
    comment: 'short week day, friday',
  }),
  sat: defineMessage({
    message: 'SAT',
    comment: 'short week day, saturday',
  }),
} as Record<string, MessageDescriptor>;

export function WeekDaySelector(
  props: IFlexProps & {onChanged?: (weekDays: Array<WeekDay>) => void},
) {
  const [selectedDays, setSelectedDays] = useState<Record<WeekDay, boolean>>(
    {} as Record<WeekDay, boolean>,
  );

  const setSelectedDaysProxy = (obj: Record<WeekDay, boolean>) => {
    setSelectedDays(obj);
    if (typeof props.onChanged === 'function') {
      props.onChanged(
        Object.keys(obj)
          .map(k => (obj[k as WeekDay] ? (k as WeekDay) : undefined))
          .filter(Boolean) as Array<WeekDay>,
      );
    }
  };

  return (
    <FormControl>
      <FormControl.Label>{t`Repeat`}:</FormControl.Label>
      <Flex direction="row" flexWrap="wrap" {...props}>
        {Object.keys(WeekDaysShortInOrder).map(k => {
          return (
            <WeekDayButton
              onChanged={isActive => {
                setSelectedDaysProxy({
                  ...selectedDays,
                  [k as WeekDay]: isActive,
                });
              }}
              label={i18n._(WeekDaysShortInOrder[k])}
              key={k}
            />
          );
        })}
      </Flex>
    </FormControl>
  );
}
