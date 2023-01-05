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

export type SelectorValue = Partial<Record<WeekDayIndex, boolean>> | boolean;

export function WeekDaySelector(
  props: IFlexProps & {
    value?: SelectorValue;
    onChanged?: (weekDays: SelectorValue) => void;
    label?: string;
    colorScheme?: string;
  },
) {
  const [selectedDays, setSelectedDays] = useState<SelectorValue>(
    props.value || false,
  );

  const setSelectedDaysProxy = useCallback(
    (obj: SelectorValue) => {
      setSelectedDays(obj);
      if (typeof props.onChanged === 'function') {
        props.onChanged(obj);
      }
    },
    [setSelectedDays, props],
  );

  const dayChanged = useCallback(
    (isActive: boolean, dayIndex: WeekDayIndex) => {
      let values: SelectorValue = {
        ...(typeof selectedDays === 'boolean'
          ? selectedDays
            ? {
                0: true,
                1: true,
                2: true,
                3: true,
                4: true,
                5: true,
                6: true,
              }
            : {}
          : selectedDays),
        [dayIndex]: isActive,
      };
      if (!values[dayIndex]) delete values[dayIndex];
      const keysLength = keys(values).length;
      if (!keysLength) {
        values = false;
      } else if (keysLength === 7) {
        values = true;
      }
      setSelectedDaysProxy(values);
    },
    [selectedDays, setSelectedDaysProxy],
  );

  return (
    <FormControl>
      {props.label && <FormControl.Label>{props.label}:</FormControl.Label>}
      <Flex direction="row" flexWrap="wrap" {...props}>
        {keys(WeekDaysInOrder).map((dayName: string) => {
          return (
            <WeekDayButton
              dayIndex={WeekDays[dayName as WeekDayName]}
              onChanged={dayChanged}
              label={i18n._(WeekDaysInOrder[dayName])}
              key={dayName}
              colorScheme={props.colorScheme}
              isActive={
                typeof selectedDays === 'boolean'
                  ? selectedDays
                  : selectedDays[WeekDays[dayName as WeekDayName]]
              }
            />
          );
        })}
      </Flex>
    </FormControl>
  );
}
