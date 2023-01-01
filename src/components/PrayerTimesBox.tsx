import {difference} from 'lodash';
import {Box} from 'native-base';
import {memo, useEffect, useState} from 'react';
import {Prayer, PrayersInOrder, PrayerTime, PrayerTimesHelper} from '@/adhan';
import {getActivePrayer} from '@/adhan/utils';
import PrayerTimeRow from '@/components/PrayerTimeRow';
import {ADHAN_NOTIFICATION_ID} from '@/constants/notification';
import {useSettingsHelper} from '@/store/settings';

type PrayerTimesBoxProps = {
  prayerTimes?: PrayerTimesHelper;
  date: Date;
  hiddenPrayers?: Prayer[];
};

function PrayerTimesBox({prayerTimes, hiddenPrayers}: PrayerTimesBoxProps) {
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | undefined>();
  const [is24Hour] = useSettingsHelper('IS_24_HOUR_FORMAT');
  const [numberingSystem] = useSettingsHelper('NUMBERING_SYSTEM');

  useEffect(() => {
    setNextPrayer(prayerTimes?.nextPrayer());
  }, [prayerTimes]);

  const nextPrayerDateValueOf = nextPrayer?.date.valueOf();

  const [nextPrayerSoundIsMuted, setNextPrayerSoundIsMuted] = useState(false);
  const [dismissedAlarms] = useSettingsHelper('DISMISSED_ALARM_TIMESTAMPS');

  const [visiblePrayerTimes, setVisiblePrayerTimes] = useState(PrayersInOrder);
  const [activePrayer, setActivePrayer] = useState<Prayer | undefined>();

  useEffect(() => {
    setVisiblePrayerTimes(difference(PrayersInOrder, hiddenPrayers || []));
  }, [hiddenPrayers, prayerTimes]);

  useEffect(() => {
    if (prayerTimes?.date) {
      setActivePrayer(getActivePrayer(prayerTimes.date, visiblePrayerTimes));
    } else {
      setActivePrayer(undefined);
    }
  }, [prayerTimes, visiblePrayerTimes]);

  useEffect(() => {
    if (!activePrayer || !prayerTimes) return;
    if (
      !dismissedAlarms[ADHAN_NOTIFICATION_ID] ||
      !prayerTimes[activePrayer].valueOf()
    )
      return;
    if (
      prayerTimes[activePrayer].valueOf() === nextPrayerDateValueOf &&
      dismissedAlarms[ADHAN_NOTIFICATION_ID] >= nextPrayerDateValueOf
    ) {
      setNextPrayerSoundIsMuted(true);
    } else {
      setNextPrayerSoundIsMuted(false);
    }
  }, [activePrayer, dismissedAlarms, nextPrayerDateValueOf, prayerTimes]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      px="3"
      py="2"
      key={is24Hour.toString() + numberingSystem}>
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
