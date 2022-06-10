import {i18n} from '@lingui/core';
import {Box} from 'native-base';
import {useEffect, useState} from 'react';
import {PrayersInOrder, PrayerTimesExtended, prayerTranslations} from '@/adhan';
import {PrayerTimeRow} from '@/components/PrayerTimeRow';
import {getSecheduledAdhanNotificationOptions} from '@/notifee';

type PrayerTimesBoxProps = {
  prayerTimes?: PrayerTimesExtended;
};

export function PrayerTimesBox({prayerTimes}: PrayerTimesBoxProps) {
  const todayDateString = new Date().toDateString();
  const prayerTimesDateString = prayerTimes?.date?.toDateString();
  const nextPrayer = prayerTimes?.nextPrayer();

  const [nextPrayerIsDismissed, setNextPrayerIsDismissed] = useState(false);

  useEffect(() => {
    getSecheduledAdhanNotificationOptions().then(options => {
      if ((options?.date.valueOf() || 0) > (nextPrayer?.date.valueOf() || 0)) {
        setNextPrayerIsDismissed(true);
      }
    });
  });

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
