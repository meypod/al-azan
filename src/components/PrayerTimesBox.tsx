import {i18n} from '@lingui/core';
import {Box} from 'native-base';
import {useEffect, useState} from 'react';
import {PrayersInOrder, PrayerTimesExtended, prayerTranslations} from '@/adhan';
import {PrayerTimeRow} from '@/components/PrayerTimeRow';
import {useSettingsHelper} from '@/store/settings';

type PrayerTimesBoxProps = {
  prayerTimes?: PrayerTimesExtended;
};

export function PrayerTimesBox({prayerTimes}: PrayerTimesBoxProps) {
  const todayDateString = new Date().toDateString();
  const prayerTimesDateString = prayerTimes?.date?.toDateString();
  const nextPrayer = prayerTimes?.nextPrayer();
  const nextPrayerDateValueOf = nextPrayer?.date.valueOf();

  const [nextPrayerIsDismissed, setNextPrayerIsDismissed] = useState(false);
  const [scheduledValueOf] = useSettingsHelper('SCHEDULED_ALARM_DATE_VALUE');

  useEffect(() => {
    if (!scheduledValueOf || !nextPrayerDateValueOf) return;
    if (scheduledValueOf > nextPrayerDateValueOf) {
      setNextPrayerIsDismissed(true);
    } else {
      setNextPrayerIsDismissed(false);
    }
  }, [nextPrayerDateValueOf, scheduledValueOf]);

  return (
    <Box display="flex" flexDirection="column" padding="3">
      {PrayersInOrder.map(prayer => (
        <PrayerTimeRow
          key={prayer}
          date={prayerTimes && prayerTimes[prayer]}
          active={
            nextPrayer?.prayer === prayer &&
            todayDateString === prayerTimesDateString
          }
          isActiveDismissed={nextPrayerIsDismissed}
          title={i18n._(prayerTranslations[prayer.toLowerCase()])}
        />
      ))}
    </Box>
  );
}
