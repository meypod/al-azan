import {writeFile, mkdir} from 'node:fs/promises';
import {t} from '@lingui/macro';
import {loadLocale, localeFallbacks} from '../../src/i18n_base';

async function updateFiles() {
  for (const l of localeFallbacks) {
    if (l.base === 'en') {
      // skip english
      continue;
    }

    loadLocale(l.base);
    const langFolder = `./fastlane/metadata/android/${l.base}`;
    await mkdir(langFolder + '/', {recursive: true});

    const shortDesc = t({
      message: `Privacy focused open-source muslim Adhan (islamic prayer times) and qibla app`,
      comment: 'Max. 80 characters',
    });
    await writeFile(`${langFolder}/short_description.txt`, shortDesc, {
      encoding: 'utf8',
      flag: 'w',
    });

    await writeFile(
      `${langFolder}/title.txt`,
      t({
        message: `Al-Azan - Prayer Times`,
        comment: 'Max. 30 characters',
      }),
      {
        encoding: 'utf8',
        flag: 'w',
      },
    );

    const fullDesc = `${shortDesc}

${t`App features`}:

* ${t`Ad-Free`}

* ${t`Doesn't use any kind of trackers`}

* ${t`Open-source`}

* ${t`You can search for your location offline Or use GPS`}

* ${t`Set custom Adhan audio`}

* ${t`Select different Adhan audio for Fajr namaz`}

* ${t`In addition to five daily prayers, it has settings for Sunrise, Sunset, Midnight and Night Prayer (Tahajjud)`}

* ${t`Many options for Adhan (اذان) calculation`}

* ${t`Light and Dark theme`}

* ${t`Hide times you don't need`}

* ${t`Set reminders before or after a prayer time`}

* ${t`Homescreen and notification Widgets`}

* ${t`Qibla finder`}

* ${t`Qada counter`}

* ${t`Is localized in English, Persian, Arabic, Turkish, Indonesian, French, Urdu, Hindi, German, Bosnian, Vietnamese, Bangla`}

${t`Open source repository`}:
https://github.com/meypod/al-azan

${t`Since we don't use any kind of tracker or crash analytics, please report any problem or suggestion you have on our github repo`}:
https://github.com/meypod/al-azan/issues`;

    await writeFile(`${langFolder}/full_description.txt`, fullDesc, {
      encoding: 'utf8',
      flag: 'w',
    });
  }
}

console.log('Running meta-data sync');

updateFiles();
