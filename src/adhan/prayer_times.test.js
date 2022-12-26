import {isMinimumSettingsAvailable} from '@/adhan';

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
    // it('calculates the same prayer times across all times in a day in the said timezone', () => {});
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
