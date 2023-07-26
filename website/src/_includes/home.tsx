import h from 'vhtml';
import {loadLocale, i18n} from '../../i18n_base';
import type {Page} from '../_type/page';

export function data() {
  return {
    includeCss: ['css/home.css', 'css/app-image.css'],
    eleventyComputed: {
      title: ({page}: {page: Page}) => {
        loadLocale(page.lang);
        return i18n._({
          id: 'Al-Azan - Prayer Times',
        });
      },
      description: ({page}: {page: Page}) => {
        loadLocale(page.lang);
        return i18n._(
          `Privacy focused open-source muslim Adhan (islamic prayer times) and qibla app`,
        );
      },
    },
  };
}

export async function render({page}: ReturnType<typeof data> & {page: Page}) {
  loadLocale(page.lang);

  return (
    <>
      <section className="section">
        <div className="bg-rect"></div>
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="app-title-container">
                <h1 className="app-title">{i18n._('Al-Azan')}</h1>
                <h2 className="app-subtitle">
                  {i18n._('Prayer Times') + ' | ' + i18n._('Qibla')}
                </h2>
                <div className="badge-container">
                  <a href="https://f-droid.org/packages/com.github.meypod.al_azan/">
                    <img
                      className="badge-btn"
                      src={`/images/f-droid/get-it-on-${page.lang}.png`}
                      alt="download"
                      width="646"
                      height="250"
                    />
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=com.github.meypod.al_azan">
                    <img
                      className="badge-btn"
                      src={`/images/gplay/get-it-on-${page.lang}.png`}
                      alt="download"
                      width="646"
                      height="250"
                    />
                  </a>
                </div>
              </div>
            </div>
            <div className="col app-image-col">
              <div className="app-image-container">
                <div
                  className="app-image"
                  role="img"
                  aria-label="image of app's home screen"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section text-section">
        <div className="bg-rect-2"></div>
        <div className="container">
          <div className="row text-section">
            <h3>{i18n._('App features')}</h3>
            <ul>
              <li>{i18n._('Ad-Free')}</li>
              <li>{i18n._("Doesn't use any kind of trackers")}</li>
              <li>{i18n._('Open-source')}</li>
              <li>
                {i18n._('You can search for your location offline Or use GPS')}
              </li>
              <li>{i18n._('Set custom Adhan audio')}</li>
              <li>{i18n._('Select different Adhan audio for Fajr namaz')}</li>
              <li>
                {i18n._(
                  'In addition to five daily prayers, it has settings for Sunrise, Sunset, Midnight and Night Prayer (Tahajjud)',
                )}
              </li>
              <li>{i18n._('Many options for Adhan (اذان) calculation')}</li>
              <li>{i18n._('Light/Dark theme')}</li>
              <li>{i18n._("Hide times you don't need")}</li>
              <li>{i18n._('Set reminders before or after a prayer time')}</li>
              <li>{i18n._('Homescreen and notification Widgets')}</li>
              <li>{i18n._('Qibla finder')}</li>
              <li>{i18n._('Qada counter')}</li>
              <li>
                {i18n._(
                  'Is localized in English, Persian, Arabic, Turkish, Indonesian, French, Urdu, Hindi, German, Bosnian, Vietnamese, Bangla',
                )}
              </li>
            </ul>
            <p>{i18n._('Open source repository')}:</p>
            <a href="https://github.com/meypod/al-azan/">
              https://github.com/meypod/al-azan
            </a>
            <p>
              {i18n._(
                "Since we don't use any kind of tracker or crash analytics, please report any problem or suggestion you have on our github repo",
              )}
              :
            </p>
            <a href="https://github.com/meypod/al-azan/issues">
              https://github.com/meypod/al-azan/issues
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
