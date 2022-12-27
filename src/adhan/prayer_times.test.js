import {getPrayerTimes, isMinimumSettingsAvailable} from '@/adhan';
import {calcSettings} from '@/store/calculation_settings';

const timezones = {
  UTC: 'UTC',
  Afghanistan: 'Asia/Kabul',
};

function getTimezoneIdentity(tz) {
  if (tz === timezones.UTC) {
    return 'Coordinated Universal Time';
  }
  if (tz === timezones.Afghanistan) {
    return 'Afghanistan Time';
  }

  return 'time_zone_identity_not_found';
}

const tests = timezone =>
  describe('timezone is set to ' + timezone, () => {
    beforeAll(() => {
      // eslint-disable-next-line no-undef
      changeTimezone(timezone);
    });

    afterAll(() => {
      // eslint-disable-next-line no-undef
      changeTimezone('');
    });

    it('timezone change works', () => {
      expect(new Date().toString()).toContain(getTimezoneIdentity(timezone));
    });

    describe('getPrayerTimes()', () => {
      beforeAll(() => {
        calcSettings.setState({
          LOCATION_LAT: 1,
          LOCATION_LONG: 1,
          CALCULATION_METHOD_KEY: 'MoonsightingCommittee', // doesn't matter which for test
        });
      });
      afterAll(() => {
        calcSettings.setState({
          LOCATION_LAT: undefined,
          LOCATION_LONG: undefined,
          CALCULATION_METHOD_KEY: undefined,
        });
      });
      it('returns the same prayer for any time inside the same date', () => {
        const date1 = new Date('Tue Dec 27 2022 00:00:00');
        const date2 = new Date('Tue Dec 27 2022 00:01:00');
        const date3 = new Date('Tue Dec 27 2022 12:00:00');
        const date4 = new Date('Tue Dec 27 2022 23:59:59');
        const pt1 = getPrayerTimes(date1);
        const pt2 = getPrayerTimes(date2);
        const pt3 = getPrayerTimes(date3);
        const pt4 = getPrayerTimes(date4);
        delete pt1.date; // as we don't care about the dates comparison
        delete pt2.date;
        delete pt3.date;
        delete pt4.date;
        expect(pt1).toStrictEqual(pt2);
        expect(pt1).toStrictEqual(pt3);
        expect(pt1).toStrictEqual(pt4);

        const date5 = new Date('Tue Dec 28 2022 00:00:00');
        const pt5 = getPrayerTimes(date5);
        delete pt5.date;
        expect(pt5).not.toStrictEqual(pt1);
      });
    });
  });

describe('prayer times works properly over different timezones', () => {
  for (const tz in timezones) {
    tests(timezones[tz]);
  }
});

describe('prayer times minimum settings check works as expected', () => {
  it('returns false if minimum settings is missing', () => {
    expect(isMinimumSettingsAvailable({})).toBeFalsy();
    expect(isMinimumSettingsAvailable()).toBeFalsy();
  });

  it('returns true when minimum settings is passed to it', () => {
    /** 0 0 lat long coordinates is very unlikely to happen,
     *  so no need to handle it, its in the middle of the ocean ;) */
    expect(
      isMinimumSettingsAvailable({
        LOCATION_LAT: 1,
        LOCATION_LONG: 1,
        CALCULATION_METHOD_KEY: 'something',
      }),
    ).toBeTruthy();
  });

  it('returns false when minimum settings coordinates is not a number', () => {
    expect(
      isMinimumSettingsAvailable({
        LOCATION_LAT: 'foo',
        LOCATION_LONG: 'bar',
        CALCULATION_METHOD_KEY: 'something',
      }),
    ).toBeFalsy();
  });
});
