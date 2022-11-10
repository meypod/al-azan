import {MessageDescriptor, i18n} from '@lingui/core';
import {t, defineMessage} from '@lingui/macro';

import {Flex, FormControl, IFlexProps} from 'native-base';
import {useState} from 'react';
import {WeekDayButton} from '@/components/week_day_button';
import {WeekDay} from '@/store/settings';

export const WeekDaysShortInOrder = {
  sunday: defineMessage({
    message: 'Sunday',
  }),
  monday: defineMessage({
    message: 'Monday',
  }),
  tuesday: defineMessage({
    message: 'Tuesday',
  }),
  wednesday: defineMessage({
    message: 'Wednesday',
  }),
  thursday: defineMessage({
    message: 'Thursday',
  }),
  friday: defineMessage({
    message: 'Friday',
  }),
  saturday: defineMessage({
    message: 'Saturday',
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
