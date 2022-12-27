import {getPrayerTimes, isMinimumSettingsAvailable} from '@/adhan';
import {calcSettings} from '@/store/calculation_settings';

const timezone_mock = require('timezone-mock');

const timezones = {
  UTC: 'UTC',
  Australia: 'Australia/Adelaide',
  Brazil: 'Brazil/East',
};

function getTimezoneIdentity(tz) {
  if (tz === timezones.UTC) {
    return 'MockDate: GMT+0000';
  }
  if (tz === timezones.Australia) {
    return ['MockDate: GMT+1030', 'MockDate: GMT+0930'];
  }
  if (tz === timezones.Brazil) {
    return ['MockDate: GMT-0200', 'MockDate: GMT-0300'];
  }

  return 'time_zone_identity_not_found';
}

const tests = timezone =>
  describe('timezone is set to ' + timezone, () => {
    beforeAll(() => {
      // eslint-disable-next-line no-undef
      timezone_mock.register(timezone);
    });

    afterAll(() => {
      // eslint-disable-next-line no-undef
      timezone_mock.unregister();
    });

    it('timezone change works', () => {
      const tzId = getTimezoneIdentity(timezone);
      if (Array.isArray(tzId)) {
        expect(
          tzId.find(id => new Date().toString().includes(id)),
        ).toBeTruthy();
      } else {
        expect(new Date().toString()).toContain(tzId);
      }
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
        // we dont include the timezone deliberately, to use the timezone defined in the beginning of test
        const date1 = new Date('2022-12-27 00:00:00');
        const date2 = new Date('2022-12-27 00:01:00');
        const date3 = new Date('2022-12-27 12:00:00');
        const date4 = new Date('2022-12-27 23:59:59');
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

        const date5 = new Date('2022-12-28 00:00:00');
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
