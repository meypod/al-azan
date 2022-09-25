import {difference} from 'lodash';
import {Box} from 'native-base';
import {memo, useEffect, useState} from 'react';
import {Prayer, PrayersInOrder, PrayerTime, PrayerTimesExtended} from '@/adhan';
import {getActivePrayer} from '@/adhan/utils';
import PrayerTimeRow from '@/components/PrayerTimeRow';
import {
  getAdhanSettingKey,
  useCalcSettings,
} from '@/store/calculation_settings';
import {useSettingsHelper} from '@/store/settings';

type PrayerTimesBoxProps = {
  prayerTimes?: PrayerTimesExtended;
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
  const [scheduledValueOf] = useSettingsHelper('SCHEDULED_ALARM_TIMESTAMP');
  const calcSettings = useCalcSettings(state => state);

  const [visiblePrayerTimes, setVisiblePrayerTimes] = useState(PrayersInOrder);
  const [activePrayer, setActivePrayer] = useState<Prayer | undefined>();

  useEffect(() => {
    setVisiblePrayerTimes(difference(PrayersInOrder, hiddenPrayers || []));
  }, [hiddenPrayers, prayerTimes]);

  useEffect(() => {
    setActivePrayer(getActivePrayer(prayerTimes, visiblePrayerTimes));
  }, [prayerTimes, visiblePrayerTimes]);

  useEffect(() => {
    if (!activePrayer || !prayerTimes) return;
    if (!scheduledValueOf || !prayerTimes[activePrayer].valueOf()) return;
    if (
      prayerTimes[activePrayer].valueOf() === nextPrayerDateValueOf &&
      scheduledValueOf > nextPrayerDateValueOf &&
      calcSettings[getAdhanSettingKey(activePrayer, 'sound')]
    ) {
      setNextPrayerSoundIsMuted(true);
    } else {
      setNextPrayerSoundIsMuted(false);
    }
  }, [
    activePrayer,
    calcSettings,
    nextPrayerDateValueOf,
    prayerTimes,
    scheduledValueOf,
  ]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      padding="3"
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
