import {
  getPrayerTimes,
  isMinimumSettingsAvailable,
  Prayer,
  PrayersInOrder,
  getNextPrayer,
  getNextPrayerByDays,
} from '@/adhan';
import {alarmSettings, getAdhanSettingKey} from '@/store/alarm';
import {calcSettings} from '@/store/calculation';
import {addDays, getDayBeginning} from '@/utils/date';

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
          LOCATION: {
            lat: 1,
            long: 1,
          },
          CALCULATION_METHOD_KEY: 'MoonsightingCommittee', // doesn't matter which for test
        });
      });
      afterAll(() => {
        calcSettings.setState({
          LOCATION: undefined,
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

      it('passes the two year stress test', () => {
        // we dont include the timezone deliberately, to use the timezone defined in the beginning of test
        const testDate = new Date('2022-01-01 00:00:00');
        for (let i = 0; i < 1470; i++) {
          // 1470 = 4 years + 10 days to test the leap years as well
          getPrayerTimes(addDays(testDate, i));
          // if this test is not working, it will loop infinitely, or throw.
        }
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
        LOCATION: {
          lat: 1,
          long: 1,
        },
        CALCULATION_METHOD_KEY: 'something',
      }),
    ).toBeTruthy();
  });

  it('returns false when minimum settings coordinates is not a number', () => {
    expect(
      isMinimumSettingsAvailable({
        LOCATION: {
          lat: 'foo',
          long: 'bar',
        },
        CALCULATION_METHOD_KEY: 'something',
      }),
    ).toBeFalsy();
  });
});

describe('getNextPrayer()', () => {
  beforeAll(() => {
    calcSettings.setState({
      LOCATION: {
        lat: 1,
        long: 1,
      },
      CALCULATION_METHOD_KEY: 'MoonsightingCommittee', // doesn't matter which for test
    });
  });
  afterAll(() => {
    calcSettings.setState({
      LOCATION: undefined,
      CALCULATION_METHOD_KEY: undefined,
    });
  });

  describe('when {useSettings: true} option is used', () => {
    function resetNotificationSoundSettings() {
      const patch = {};
      for (const prayer of PrayersInOrder) {
        patch[getAdhanSettingKey(prayer, 'sound')] = undefined;
        patch[getAdhanSettingKey(prayer, 'notify')] = undefined;
      }
      alarmSettings.setState(patch);
    }
    // we always clear settings before and after each test here
    beforeEach(() => {
      resetNotificationSoundSettings();
    });
    afterEach(() => {
      resetNotificationSoundSettings();
    });

    it('returns undefined when notification/sound settings is empty', () => {
      expect(
        getNextPrayer({
          useSettings: true,
          date: new Date('2022-12-27T00:00:00.000Z'),
        }),
      ).toBeUndefined();
    });

    describe('With given notification/sound settings', () => {
      beforeEach(() => {
        resetNotificationSoundSettings();
      });
      afterEach(() => {
        resetNotificationSoundSettings();
      });

      it('returns the correct prayer (without checkNextDay[s])', () => {
        alarmSettings.setState({FAJR_NOTIFY: true});

        expect(
          getNextPrayer({
            useSettings: true,
            date: new Date('2022-12-27T00:00:00.000Z'),
          }),
        ).toEqual({
          calculatedFrom: new Date('2022-12-27T00:00:00.000Z'),
          date: new Date('2022-12-27T04:40:00.000Z'),
          playSound: false,
          prayer: 'fajr',
        });

        alarmSettings.setState({FAJR_SOUND: true});
        expect(
          getNextPrayer({
            date: new Date('2022-12-27T00:00:00.000Z'),
            useSettings: true,
          }),
        ).toEqual({
          calculatedFrom: new Date('2022-12-27T00:00:00.000Z'),
          date: new Date('2022-12-27T04:40:00.000Z'),
          playSound: true,
          prayer: 'fajr',
        });

        // test with advancing clock after the set prayer
        // this should yield undefined
        expect(
          getNextPrayer({
            date: new Date(
              new Date('2022-12-27T04:40:00.000Z').valueOf() + 1000,
            ),
            useSettings: true,
          }),
        ).toBe(undefined);

        // test with a gap and enabling dhuhr
        alarmSettings.setState({DHUHR_NOTIFY: true});
        expect(
          getNextPrayer({
            date: new Date(
              new Date('2022-12-27T04:40:00.000Z').valueOf() + 1000,
            ),
            useSettings: true,
          }),
        ).toEqual({
          calculatedFrom: new Date(
            new Date('2022-12-27T04:40:00.000Z').valueOf() + 1000,
          ),
          date: new Date('2022-12-27T12:02:00.000Z'),
          playSound: false,
          prayer: 'dhuhr',
        });

        // test with last time (usually goes over to next day)
        alarmSettings.setState({TAHAJJUD_NOTIFY: true, TAHAJJUD_SOUND: true});
        expect(
          getNextPrayer({
            date: new Date(
              new Date('2022-12-27T12:02:00.000Z').valueOf() + 1000,
            ),
            useSettings: true,
          }),
        ).toEqual({
          calculatedFrom: new Date(
            new Date('2022-12-27T12:02:00.000Z').valueOf() + 1000,
          ),
          date: new Date('2022-12-28T01:08:00.000Z'),
          playSound: true,
          prayer: 'tahajjud',
        });

        // test by setting tahajjud, and getting next prayer when the time is
        // behind the tahajjud, which is usually part of previous day's prayer times
        // so for example, if we are at 00:01 (AM) and tahajjud is 01:08 (AM),
        // it should return the tahajjud from the previous day's prayer times
        // without proper implementation, it would return today's fajr prayer probably.
        expect(
          getNextPrayer({
            date: new Date(
              new Date('2022-12-28T00:01:00.000Z').valueOf() + 1000,
            ),
            useSettings: true,
          }),
        ).toEqual({
          calculatedFrom: addDays(
            new Date(
              new Date('2022-12-28T00:01:00.000Z').valueOf() + 1000, // it should be from the previous day
            ),
            -1,
          ),
          date: new Date('2022-12-28T01:08:00.000Z'),
          playSound: true,
          prayer: 'tahajjud',
        });
      });

      it('returns the next available prayer (with checkNextDay[s])', () => {
        alarmSettings.setState({FAJR_NOTIFY: true});

        expect(alarmSettings.getState()['FAJR_NOTIFY']).toBe(true);

        expect(
          getNextPrayer({
            date: new Date('2022-12-27T00:00:00.000Z'),
            useSettings: true,
          }),
        ).toEqual({
          calculatedFrom: new Date('2022-12-27T00:00:00.000Z'),
          date: new Date('2022-12-27T04:40:00.000Z'),
          playSound: false,
          prayer: 'fajr',
        });

        // test with advancing clock after the set prayer
        // this should yield tomorrow's fajr
        let testDate = new Date(
          new Date('2022-12-27T04:40:00.000Z').valueOf() + 1000,
        );
        let nextDayOfTestDate = getDayBeginning(addDays(testDate, 1));
        expect(
          getNextPrayer({
            date: testDate,
            useSettings: true,
            checkNextDay: true,
          }),
        ).toEqual({
          calculatedFrom: nextDayOfTestDate,
          date: new Date('2022-12-28T04:41:00.000Z'),
          playSound: false,
          prayer: 'fajr',
        });

        // repeat with checkNextDays
        expect(
          getNextPrayer({
            date: testDate,
            useSettings: true,
            checkNextDays: true,
          }),
        ).toEqual({
          calculatedFrom: nextDayOfTestDate,
          date: new Date('2022-12-28T04:41:00.000Z'),
          playSound: false,
          prayer: 'fajr',
        });
      });

      it('skips days that are disabled (check next days)', () => {
        alarmSettings.setState({FAJR_NOTIFY: {0: true}});
        const testDate = new Date('2022-12-25T09:00:00.000Z'); // near the end of the day, so fajr is behind us, but dhuhr in front
        expect(testDate.getDay()).toBe(0);

        {
          const next = getNextPrayer({
            date: testDate,
            useSettings: true,
            checkNextDays: true,
          });
          expect(next).toBeTruthy();
          expect(next.playSound).toBeFalsy();
          expect(next.prayer).toEqual(Prayer.Fajr);
          // next prayer should be on the same day as settings
          expect(next.date.getDay()).toEqual(0);
          // it should be at least 6 days away
          expect(next.date.valueOf() - testDate.valueOf()).toBeGreaterThan(
            6 * 24 * 60 * 60 * 1000,
          );
        }

        alarmSettings.setState({
          FAJR_NOTIFY: {0: true},
          DHUHR_NOTIFY: {0: true},
        });
        {
          const next = getNextPrayer({
            date: testDate,
            useSettings: true,
            checkNextDays: true,
          });
          expect(next).toBeTruthy();
          expect(next.playSound).toBeFalsy();
          expect(next.prayer).toEqual(Prayer.Dhuhr);
          expect(next.date.getDay()).toEqual(0);
          expect(next.date.valueOf() - testDate.valueOf()).toBeLessThan(
            10 * 60 * 60 * 1000, // within 10 hours of fajr
          );
        }

        alarmSettings.setState({
          FAJR_NOTIFY: {0: true},
          DHUHR_NOTIFY: {1: true},
        });

        {
          const next = getNextPrayer({
            date: testDate,
            useSettings: true,
            checkNextDays: true,
          });
          expect(next).toBeTruthy();
          expect(next.playSound).toBeFalsy();
          expect(next.prayer).toEqual(Prayer.Dhuhr);
          expect(next.date.getDay()).toEqual(1);
          expect(next.date.valueOf() - testDate.valueOf()).toBeLessThan(
            2 * 24 * 60 * 60 * 1000, // within 48 hours
          );
        }

        // REPEAT previous with sound true for dhuhr
        alarmSettings.setState({
          FAJR_NOTIFY: {0: true},
          DHUHR_NOTIFY: {1: true},
          DHUHR_SOUND: true,
        });

        {
          const next = getNextPrayer({
            date: testDate,
            useSettings: true,
            checkNextDays: true,
          });
          expect(next).toBeTruthy();
          expect(next.playSound).toBeTruthy();
          expect(next.prayer).toEqual(Prayer.Dhuhr);
          expect(next.date.getDay()).toEqual(1);
          expect(next.date.valueOf() - testDate.valueOf()).toBeLessThan(
            2 * 24 * 60 * 60 * 1000, // within 48 hours
          );
        }

        // REPEAT previous with sound partially true (only for monday)
        alarmSettings.setState({
          FAJR_NOTIFY: {0: true},
          DHUHR_NOTIFY: {0: true, 2: true},
          DHUHR_SOUND: {0: true},
        });

        {
          const next = getNextPrayer({
            date: testDate,
            useSettings: true,
            checkNextDays: true,
          });
          expect(next).toBeTruthy();
          expect(next.playSound).toBeTruthy();
          expect(next.prayer).toEqual(Prayer.Dhuhr);
          expect(next.date.getDay()).toEqual(0);
        }

        {
          // testing notify and no partial sound (monday)
          const next = getNextPrayer({
            date: addDays(testDate, 1),
            useSettings: true,
            checkNextDays: true,
          });
          expect(next).toBeTruthy();
          expect(next.date.getDay()).toEqual(2);
          expect(next.playSound).toBeFalsy();
          expect(next.prayer).toEqual(Prayer.Dhuhr);
        }
      });
    });
  });
});

describe('getNextPrayerByDays()', () => {
  beforeAll(() => {
    calcSettings.setState({
      LOCATION: {
        lat: 1,
        long: 1,
      },
      CALCULATION_METHOD_KEY: 'MoonsightingCommittee', // doesn't matter which for test
    });
  });
  afterAll(() => {
    calcSettings.setState({
      LOCATION: undefined,
      CALCULATION_METHOD_KEY: undefined,
    });
  });

  describe('when {days} in option is used', () => {
    it('returns undefined when days settings is undefined', () => {
      expect(
        getNextPrayerByDays({
          date: new Date('2022-12-27T00:00:00.000Z'),
          days: undefined,
        }),
      ).toBeUndefined();
    });

    describe('With given days and a prayer', () => {
      it('returns the correct prayer (without checkNextDays)', () => {
        expect(
          getNextPrayerByDays({
            days: true,
            prayers: [Prayer.Fajr],
            date: new Date('2022-12-27T00:00:00.000Z'),
          }),
        ).toEqual({
          calculatedFrom: new Date('2022-12-27T00:00:00.000Z'),
          date: new Date('2022-12-27T04:40:00.000Z'),
          prayer: 'fajr',
        });

        // test by setting tahajjud, and getting next prayer when the time is
        // behind the tahajjud, which is usually part of previous day's prayer times
        // so for example, if we are at 00:01 (AM) and tahajjud is 01:08 (AM),
        // it should return the tahajjud from the previous day's prayer times
        // without proper implementation, it would return today's fajr prayer probably.
        expect(
          getNextPrayerByDays({
            date: new Date(
              new Date('2022-12-28T00:01:00.000Z').valueOf() + 1000,
            ),
            prayers: [Prayer.Tahajjud],
            days: true,
          }),
        ).toEqual({
          calculatedFrom: addDays(
            new Date(
              new Date('2022-12-28T00:01:00.000Z').valueOf() + 1000, // it should be from the previous day
            ),
            -1,
          ),
          date: new Date('2022-12-28T01:08:00.000Z'),
          prayer: 'tahajjud',
        });
      });

      it('skips days that are disabled (checks next days)', () => {
        const testDate = new Date('2022-12-25T09:00:00.000Z'); // near the end of the day, so fajr is behind us, but dhuhr in front
        expect(testDate.getDay()).toBe(0);

        {
          const next = getNextPrayerByDays({
            date: testDate,
            days: {0: true},
            prayers: [Prayer.Fajr],
          });
          expect(next).toBeTruthy();
          expect(next.prayer).toEqual(Prayer.Fajr);
          // next prayer should be on the same day as settings
          expect(next.date.getDay()).toEqual(0);
          // it should be at least 6 days away
          expect(next.date.valueOf() - testDate.valueOf()).toBeGreaterThan(
            6 * 24 * 60 * 60 * 1000,
          );
        }

        {
          const next = getNextPrayerByDays({
            date: testDate,
            days: {0: true},
            prayers: [Prayer.Dhuhr],
          });
          expect(next).toBeTruthy();
          expect(next.prayer).toEqual(Prayer.Dhuhr);
          expect(next.date.getDay()).toEqual(0);
          expect(next.date.valueOf() - testDate.valueOf()).toBeLessThan(
            10 * 60 * 60 * 1000, // within 10 hours of fajr
          );
        }

        {
          const next = getNextPrayerByDays({
            date: testDate,
            days: {1: true},
            prayers: [Prayer.Dhuhr],
          });
          expect(next).toBeTruthy();
          expect(next.prayer).toEqual(Prayer.Dhuhr);
          expect(next.date.getDay()).toEqual(1);
          expect(next.date.valueOf() - testDate.valueOf()).toBeLessThan(
            2 * 24 * 60 * 60 * 1000, // within 48 hours
          );
        }

        {
          const next = getNextPrayerByDays({
            date: testDate,
            days: {6: true},
            prayers: [Prayer.Dhuhr],
          });
          expect(next).toBeTruthy();
          expect(next.prayer).toEqual(Prayer.Dhuhr);
          expect(next.date.getDay()).toEqual(6);
          expect(next.date.valueOf() - testDate.valueOf()).toBeLessThan(
            7 * 24 * 60 * 60 * 1000, // within 7 days
          );
        }
      });
    });
  });
});
