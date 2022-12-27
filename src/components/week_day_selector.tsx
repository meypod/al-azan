import {MessageDescriptor, i18n} from '@lingui/core';
import {defineMessage} from '@lingui/macro';

import keys from 'lodash/keys';
import {Flex, FormControl, IFlexProps} from 'native-base';
import {useCallback, useState} from 'react';
import {WeekDayButton} from '@/components/week_day_button';
import {WeekDayIndex, WeekDayName, WeekDays} from '@/utils/date';

export const WeekDaysInOrder = {
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
  props: IFlexProps & {
    onChanged?: (weekDays: Array<WeekDayIndex>) => void;
    label?: string;
  },
) {
  const [selectedDays, setSelectedDays] = useState<
    Partial<Record<WeekDayIndex, boolean>>
  >({});

  const setSelectedDaysProxy = useCallback(
    (obj: typeof selectedDays) => {
      setSelectedDays(obj);
      if (typeof props.onChanged === 'function') {
        props.onChanged(
          keys(obj)
            .map((k: string) =>
              obj[k as unknown as WeekDayIndex] ? k : undefined,
            )
            .filter(Boolean) as unknown as Array<WeekDayIndex>,
        );
      }
    },
    [setSelectedDays, props],
  );

  return (
    <FormControl>
      {props.label && <FormControl.Label>{props.label}:</FormControl.Label>}
      <Flex direction="row" flexWrap="wrap" {...props}>
        {keys(WeekDaysInOrder).map((dayName: string) => {
          return (
            <WeekDayButton
              onChanged={isActive => {
                setSelectedDaysProxy({
                  ...selectedDays,
                  [WeekDays[dayName as WeekDayName]]: isActive,
                });
              }}
              label={i18n._(WeekDaysInOrder[dayName])}
              key={dayName}
            />
          );
        })}
      </Flex>
    </FormControl>
  );
}
