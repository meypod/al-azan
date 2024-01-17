import {MessageDescriptor, i18n} from '@lingui/core';
import {defineMessage} from '@lingui/macro';

import keys from 'lodash/keys';
import {Stack, IStackProps} from 'native-base';
import {memo, useCallback} from 'react';
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

function isDayActive(dayName: WeekDayName, value: SelectorValue | undefined) {
  if (!value) return false;

  if (typeof value === 'boolean') {
    return value;
  }

  return value[WeekDays[dayName]];
}

export const WeekDaySelector = memo(function WeekDaySelector(
  props: IStackProps & {
    value?: SelectorValue;
    onChanged?: (weekDays: SelectorValue) => void;
    label?: string;
    colorScheme?: string;
  },
) {
  const setSelectedDaysProxy = useCallback(
    (obj: SelectorValue) => {
      props.onChanged && props.onChanged(obj);
    },
    [props],
  );

  const dayChanged = useCallback(
    (isActive: boolean, dayIndex: WeekDayIndex) => {
      let values: SelectorValue = {
        ...(typeof props.value === 'boolean'
          ? props.value
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
          : props.value),
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
    [props.value, setSelectedDaysProxy],
  );

  return (
    <Stack flexDirection="row" flexWrap="wrap" {...props}>
      {keys(WeekDaysInOrder).map((dayName: string) => {
        return (
          <WeekDayButton
            dayIndex={WeekDays[dayName as WeekDayName]}
            onChanged={dayChanged}
            label={i18n._(WeekDaysInOrder[dayName])}
            key={dayName}
            colorScheme={props.colorScheme}
            isActive={isDayActive(dayName as WeekDayName, props.value)}
          />
        );
      })}
    </Stack>
  );
});
