import {i18n} from '@lingui/core';
import {difference} from 'lodash';
import {Box} from 'native-base';
import {memo, useEffect, useState} from 'react';
import {
  Prayer,
  PrayersInOrder,
  PrayerTimesExtended,
  prayerTranslations,
} from '@/adhan';
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
  const todayDateString = new Date().toDateString();
  const prayerTimesDateString = prayerTimes?.date?.toDateString();
  const nextPrayer = prayerTimes?.nextPrayer();
  const nextPrayerDateValueOf = nextPrayer?.date.valueOf();

  const [nextPrayerSoundIsMuted, setNextPrayerSoundIsMuted] = useState(false);
  const [scheduledValueOf] = useSettingsHelper('SCHEDULED_ALARM_TIMESTAMP');
  const calcSettings = useCalcSettings(state => state);

  const visiblePrayerTimes = difference(PrayersInOrder, hiddenPrayers || []);
  let activePrayer: Prayer | undefined;

  if (todayDateString === prayerTimesDateString && prayerTimes) {
    for (let prayer of visiblePrayerTimes) {
      if (prayerTimes[prayer] && prayerTimes[prayer].valueOf() > Date.now()) {
        activePrayer = prayer;
        break;
      }
    }
  }

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
    <Box display="flex" flexDirection="column" padding="3">
      {visiblePrayerTimes.map(prayer => (
        <PrayerTimeRow
          key={prayer}
          date={prayerTimes && prayerTimes[prayer]}
          active={activePrayer === prayer}
          isActiveDismissed={nextPrayerSoundIsMuted}
          title={i18n._(prayerTranslations[prayer.toLowerCase()])}
        />
      ))}
    </Box>
  );
}

export default memo(PrayerTimesBox);
