module.exports = async () => {
  function changeTimezone(tz) {
    if (tz) {
      process.env.TZ = tz;
    } else {
      delete process.env.TZ;
    }
  }

  if (typeof global !== 'undefined') {
    global.changeTimezone = changeTimezone;
  }

  if (typeof globalThis !== 'undefined') {
    // eslint-disable-next-line no-undef
    globalThis.changeTimezone = changeTimezone;
  }
};
