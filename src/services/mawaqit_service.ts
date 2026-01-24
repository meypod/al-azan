/**
 * Mawaqit Prayer Times Service
 * Fetches prayer times from mawaqit.net for a configured mosque
 */

import {Prayer} from '@/adhan';

// Timeout for fetch requests (10 seconds)
const FETCH_TIMEOUT_MS = 10000;

/**
 * Fetch with timeout
 * @param url URL to fetch
 * @param options Fetch options
 * @param timeout Timeout in milliseconds
 * @returns Response or throws error
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

export type MawaqitPrayerTimes = {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  date: Date;
};

/**
 * Extract mosque UUID or slug from Mawaqit URL
 * @param url Full Mawaqit mosque URL (e.g., https://mawaqit.net/fr/m/mosquee-de-frejus)
 * @returns Mosque identifier (UUID or slug)
 */
function extractMosqueIdentifier(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    // Expected format: /[lang]/m/[mosque-identifier]
    const mIndex = pathParts.indexOf('m');
    if (mIndex !== -1 && pathParts[mIndex + 1]) {
      return pathParts[mIndex + 1];
    }

    // Fallback: last part of the path
    return pathParts[pathParts.length - 1] || null;
  } catch (error) {
    console.error('Invalid Mawaqit URL:', error);
    return null;
  }
}

/**
 * Parse time string in HH:MM format and combine with date
 * @param timeStr Time string (e.g., "05:30")
 * @param date Date to combine with
 * @returns Date object with the time set
 */
function parseTimeString(timeStr: string, date: Date): Date | null {
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      return null;
    }

    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  } catch (error) {
    console.error('Failed to parse time string:', timeStr, error);
    return null;
  }
}

/**
 * Fetch prayer times from Mawaqit using the iCal endpoint
 * @param mosqueUrl Mawaqit mosque URL
 * @param date Date to fetch prayer times for
 * @returns Prayer times or null if fetch fails
 */
async function fetchFromIcalEndpoint(
  mosqueUrl: string,
  date: Date,
): Promise<MawaqitPrayerTimes | null> {
  try {
    const mosqueId = extractMosqueIdentifier(mosqueUrl);
    if (!mosqueId) {
      console.error('Could not extract mosque identifier from URL:', mosqueUrl);
      return null;
    }

    // Try the ical endpoint
    const icalUrl = `${mosqueUrl}/ical`;

    const response = await fetchWithTimeout(icalUrl, {
      headers: {
        'User-Agent': 'Al-Azan-App/1.0',
      },
    });

    if (!response.ok) {
      console.error('Mawaqit iCal fetch failed:', response.status);
      return null;
    }

    const icalData = await response.text();
    return parseIcalData(icalData, date);
  } catch (error) {
    console.error('Error fetching from Mawaqit iCal:', error);
    return null;
  }
}

/**
 * Parse iCal data to extract prayer times for a specific date
 * @param icalData iCal format string
 * @param date Date to extract prayer times for
 * @returns Prayer times or null if parsing fails
 */
function parseIcalData(
  icalData: string,
  date: Date,
): MawaqitPrayerTimes | null {
  try {
    // This is a simplified iCal parser - might need enhancement
    // iCal format has VEVENT blocks with DTSTART and SUMMARY fields
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

    const events = icalData.split('BEGIN:VEVENT');
    const prayerTimes: Partial<Record<Prayer, Date>> = {};

    for (const event of events) {
      if (!event.includes('DTSTART')) continue;

      const summaryMatch = event.match(/SUMMARY:([^\r\n]+)/);
      const dtStartMatch = event.match(/DTSTART[;:]([^\r\n]+)/);

      if (!summaryMatch || !dtStartMatch) continue;

      const summary = summaryMatch[1].toLowerCase();
      const dtStart = dtStartMatch[1];

      // Check if this event is for our target date
      if (!dtStart.includes(dateStr)) continue;

      // Parse the datetime
      const eventDate = parseIcalDateTime(dtStart);
      if (!eventDate) continue;

      // Map summary to prayer
      if (summary.includes('fajr') || summary.includes('fajr')) {
        prayerTimes.fajr = eventDate;
      } else if (summary.includes('sunrise') || summary.includes('chourouk') || summary.includes('shuruq')) {
        prayerTimes.sunrise = eventDate;
      } else if (summary.includes('dhuhr') || summary.includes('dohr') || summary.includes('dhohr')) {
        prayerTimes.dhuhr = eventDate;
      } else if (summary.includes('asr') || summary.includes('assr')) {
        prayerTimes.asr = eventDate;
      } else if (summary.includes('maghrib') || summary.includes('maghreb')) {
        prayerTimes.maghrib = eventDate;
      } else if (summary.includes('isha') || summary.includes('icha')) {
        prayerTimes.isha = eventDate;
      }
    }

    // Validate we have all required prayers
    if (
      prayerTimes.fajr &&
      prayerTimes.sunrise &&
      prayerTimes.dhuhr &&
      prayerTimes.asr &&
      prayerTimes.maghrib &&
      prayerTimes.isha
    ) {
      return {
        fajr: prayerTimes.fajr,
        sunrise: prayerTimes.sunrise,
        dhuhr: prayerTimes.dhuhr,
        asr: prayerTimes.asr,
        maghrib: prayerTimes.maghrib,
        isha: prayerTimes.isha,
        date,
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing iCal data:', error);
    return null;
  }
}

/**
 * Parse iCal datetime format (YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ)
 * @param dtString iCal datetime string
 * @returns Date object or null
 */
function parseIcalDateTime(dtString: string): Date | null {
  try {
    // Remove timezone indicator if present
    const cleaned = dtString.replace(/[TZ]/g, '');

    if (cleaned.length < 8) return null;

    const year = parseInt(cleaned.substring(0, 4));
    const month = parseInt(cleaned.substring(4, 6)) - 1; // JS months are 0-indexed
    const day = parseInt(cleaned.substring(6, 8));
    const hour = cleaned.length >= 10 ? parseInt(cleaned.substring(8, 10)) : 0;
    const minute = cleaned.length >= 12 ? parseInt(cleaned.substring(10, 12)) : 0;
    const second = cleaned.length >= 14 ? parseInt(cleaned.substring(12, 14)) : 0;

    return new Date(year, month, day, hour, minute, second);
  } catch (error) {
    console.error('Failed to parse iCal datetime:', dtString, error);
    return null;
  }
}

/**
 * Fetch prayer times from Mawaqit using JSON API
 * @param mosqueUrl Mawaqit mosque URL
 * @param date Date to fetch prayer times for
 * @returns Prayer times or null if fetch fails
 */
async function fetchFromJsonApi(
  mosqueUrl: string,
  date: Date,
): Promise<MawaqitPrayerTimes | null> {
  try {
    const mosqueId = extractMosqueIdentifier(mosqueUrl);
    if (!mosqueId) {
      return null;
    }

    // Try different API endpoint patterns
    const apiEndpoints = [
      `https://mawaqit.net/api/2.0/mosque/${mosqueId}/prayer-times`,
      `https://mawaqit.net/api/mosque/${mosqueId}`,
    ];

    for (const apiUrl of apiEndpoints) {
      try {
        const response = await fetchWithTimeout(apiUrl, {
          headers: {
            'User-Agent': 'Al-Azan-App/1.0',
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = parseJsonApiResponse(data, date);
          if (parsed) return parsed;
        }
      } catch (error) {
        // Try next endpoint
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching from Mawaqit JSON API:', error);
    return null;
  }
}

/**
 * Parse JSON API response to extract prayer times
 * @param data JSON response data
 * @param date Target date
 * @returns Prayer times or null
 */
function parseJsonApiResponse(
  data: any,
  date: Date,
): MawaqitPrayerTimes | null {
  try {
    // Try different response structures
    const prayerData = data.prayer_times || data.times || data;

    // Handle array of times (calendar format)
    if (Array.isArray(prayerData)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayData = prayerData.find((d: any) => d.date === dateStr);
      if (dayData) {
        return parsePrayerTimesObject(dayData, date);
      }
    }

    // Handle direct prayer times object
    return parsePrayerTimesObject(prayerData, date);
  } catch (error) {
    console.error('Error parsing JSON API response:', error);
    return null;
  }
}

/**
 * Parse a prayer times object with various field name variations
 * @param obj Object containing prayer times
 * @param date Date for the prayer times
 * @returns Prayer times or null
 */
function parsePrayerTimesObject(
  obj: any,
  date: Date,
): MawaqitPrayerTimes | null {
  try {
    const fajr = parseTimeString(
      obj.fajr || obj.Fajr || obj.fajr_time || obj.fajr_iqama || '',
      date,
    );
    const sunrise = parseTimeString(
      obj.sunrise || obj.Sunrise || obj.shuruq || obj.chourouk || '',
      date,
    );
    const dhuhr = parseTimeString(
      obj.dhuhr || obj.Dhuhr || obj.dohr || obj.dhohr || '',
      date,
    );
    const asr = parseTimeString(
      obj.asr || obj.Asr || obj.assr || '',
      date,
    );
    const maghrib = parseTimeString(
      obj.maghrib || obj.Maghrib || obj.maghreb || '',
      date,
    );
    const isha = parseTimeString(
      obj.isha || obj.Isha || obj.icha || '',
      date,
    );

    if (fajr && sunrise && dhuhr && asr && maghrib && isha) {
      return {
        fajr,
        sunrise,
        dhuhr,
        asr,
        maghrib,
        isha,
        date,
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing prayer times object:', error);
    return null;
  }
}

/**
 * Fetch prayer times from Mawaqit for a specific date
 * Tries multiple methods: iCal, JSON API
 * @param mosqueUrl Mawaqit mosque URL
 * @param date Date to fetch prayer times for
 * @returns Prayer times or null if all methods fail
 */
export async function fetchMawaqitPrayerTimes(
  mosqueUrl: string,
  date: Date,
): Promise<MawaqitPrayerTimes | null> {
  if (!mosqueUrl) {
    console.error('Mawaqit URL not configured');
    return null;
  }

  // Try iCal endpoint first
  let times = await fetchFromIcalEndpoint(mosqueUrl, date);
  if (times) return times;

  // Fallback to JSON API
  times = await fetchFromJsonApi(mosqueUrl, date);
  if (times) return times;

  console.error('All Mawaqit fetch methods failed');
  return null;
}
