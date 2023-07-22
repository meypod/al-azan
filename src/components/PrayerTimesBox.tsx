import {difference} from 'lodash';
import {Stack, IStackProps} from 'native-base';
import {memo} from 'react';
import {PrayersInOrder} from '@/adhan';
import {getNextPrayer} from '@/adhan/prayer_times';
import {getActivePrayer} from '@/adhan/utils';
import PrayerTimeRow from '@/components/PrayerTimeRow';
import {ADHAN_NOTIFICATION_ID} from '@/constants/notification';
import {CachedPrayerTimes} from '@/store/adhan_calc_cache';
import {SettingsStore} from '@/store/settings';

type PrayerTimesBoxProps = {
  prayerTimes?: CachedPrayerTimes;
  settings: Pick<
    SettingsStore,
    'HIDDEN_PRAYERS' | 'DELIVERED_ALARM_TIMESTAMPS' | 'HIGHLIGHT_CURRENT_PRAYER'
  >;
};

function PrayerTimesBox({
  prayerTimes,
  settings,
  ...stackProps
}: PrayerTimesBoxProps & IStackProps) {
  const nextPrayer = prayerTimes?.date
    ? getNextPrayer({
        date: prayerTimes.date,
      })
    : undefined;

  const nextPrayerDateValueOf = nextPrayer?.date.valueOf();

  const visiblePrayerTimes = difference(
    PrayersInOrder,
    settings.HIDDEN_PRAYERS || [],
  );
  const activePrayer = prayerTimes?.date
    ? getActivePrayer(
        prayerTimes.date,
        visiblePrayerTimes,
        settings.HIGHLIGHT_CURRENT_PRAYER,
      )
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
    <Stack display="flex" flexDirection="column" px="3" {...stackProps}>
      {visiblePrayerTimes.map(prayer => (
        <PrayerTimeRow
          key={prayer}
          date={prayerTimes && prayerTimes[prayer]}
          active={activePrayer === prayer}
          isActiveDismissed={nextPrayerSoundIsMuted}
          prayer={prayer}
        />
      ))}
    </Stack>
  );
}

export default memo(PrayerTimesBox);
