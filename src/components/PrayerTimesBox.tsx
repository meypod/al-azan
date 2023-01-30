import {difference} from 'lodash';
import {Box} from 'native-base';
import {memo} from 'react';
import {PrayersInOrder, PrayerTimesHelper} from '@/adhan';
import {getActivePrayer} from '@/adhan/utils';
import PrayerTimeRow from '@/components/PrayerTimeRow';
import {ADHAN_NOTIFICATION_ID} from '@/constants/notification';
import {SettingsStore} from '@/store/settings';

type PrayerTimesBoxProps = {
  prayerTimes?: PrayerTimesHelper;
  settings: Pick<
    SettingsStore,
    'HIDDEN_PRAYERS' | 'DELIVERED_ALARM_TIMESTAMPS'
  >;
  date: Date;
};

function PrayerTimesBox({prayerTimes, settings}: PrayerTimesBoxProps) {
  const nextPrayer = prayerTimes?.nextPrayer();
  const nextPrayerDateValueOf = nextPrayer?.date.valueOf();

  const visiblePrayerTimes = difference(
    PrayersInOrder,
    settings.HIDDEN_PRAYERS || [],
  );
  const activePrayer = prayerTimes?.date
    ? getActivePrayer(prayerTimes.date, visiblePrayerTimes)
    : undefined;

  let nextPrayerSoundIsMuted: boolean;
  if (
    prayerTimes &&
    activePrayer &&
    prayerTimes[activePrayer].valueOf() === nextPrayerDateValueOf &&
    (settings.DELIVERED_ALARM_TIMESTAMPS[ADHAN_NOTIFICATION_ID] || 0) >=
      nextPrayerDateValueOf
  ) {
    nextPrayerSoundIsMuted = true;
  } else {
    nextPrayerSoundIsMuted = false;
  }

  return (
    <Box display="flex" flexDirection="column" px="3" py="2">
      {visiblePrayerTimes.map(prayer => (
        <PrayerTimeRow
          key={prayer}
          date={prayerTimes && prayerTimes[prayer]}
          active={activePrayer === prayer}
          isActiveDismissed={nextPrayerSoundIsMuted}
          prayer={prayer}
        />
      ))}
    </Box>
  );
}

export default memo(PrayerTimesBox);
