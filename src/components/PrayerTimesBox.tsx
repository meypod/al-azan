import {Box} from 'native-base';
import {PrayersInOrder, PrayerTimesExtended, prayerTranslations} from '@/adhan';
import {PrayerTimeRow} from '@/components/PrayerTimeRow';
import {i18n} from '@/i18n';

type PrayerTimesBoxProps = {
  prayerTimes?: PrayerTimesExtended;
};

export function PrayerTimesBox({prayerTimes}: PrayerTimesBoxProps) {
  const todayDateString = new Date().toDateString();
  const prayerTimesDateString = prayerTimes?.date?.toDateString();
  const nextPrayer = prayerTimes?.nextPrayer();

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
          title={i18n._(prayerTranslations[prayer.toLowerCase()])}
        />
      ))}
    </Box>
  );
}
