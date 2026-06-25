import h from 'vhtml';
import {loadLocale, i18n} from '../../i18n_base';
import type {Page} from '../_type/page';

export function data() {
  return {
    includeCss: ['css/privacy-policy.css'],
    eleventyComputed: {
      title: ({page}: {page: Page}) => {
        loadLocale(page.lang);
        return (
          i18n._(
            /*i18n*/ {
              id: 'Al-Azan',
              comment: "Don't translate Al-Azan name",
            },
          ) +
          ' | ' +
          i18n._('Privacy Policy')
        );
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

export function render({page}: ReturnType<typeof data> & {page: Page}) {
  loadLocale(page.lang);
  return (
    <section className="section">
      <div className="container">
        <h1>{i18n._('Privacy Policy')}</h1>
        <p>
          {i18n._(
            'All data provided to Al-Azan is only stored locally in your device. Your data is not uploaded anywhere. The developers of Al-Azan do not have access to it. Your data is not shared with any third parties. Al-Azan does not include any advertisement libraries or any 3rd party tracking (analytics) code, such as Google Analytics or Facebook SDK.',
          )}
          <br />
          {i18n._(
            'However, When using online services, such as Qibla map, app may transmit minimum necessary data that may or may not uniquely identify you. Please keep this in mind while using the app.',
          )}
        </p>
        <p>
          <strong>{i18n._('Attention')}: </strong>
          {i18n._(
            'If you have activated “Backup & Reset” in your phone settings (Settings / Backup & Reset / Back up my data), you should be aware that Android itself (not Al-Azan) will periodically save a copy of your phone’s data in Google’s servers. This allows Android to recover your data in case your device gets damaged, or you purchase a new device. The developers of Al-Azan do not have access to this data.',
          )}
        </p>
        <br />
        <h2>{i18n._('Location')}</h2>
        <p>
          {i18n._(
            'Al-Azan accesses your device location (approximate and precise) to determine your current position so it can calculate accurate prayer times and the qibla direction. With the optional “Travel mode” feature enabled, it also accesses location in the background to keep prayer times updated as you move. Location access is optional; you can instead choose your city manually.',
          )}
          <br />
          {i18n._(
            'Your location is processed only on your device to compute prayer times and the qibla direction. It is not uploaded to any server, is not shared with the developers or any third party, and is never used for advertising or tracking. You can revoke location permission at any time in your device settings, and turning off Travel mode stops any background location access.',
          )}
        </p>
        <br />
        <h2>{i18n._('Software License')}</h2>
        <p>
          {i18n._(
            'Al-Azan is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License (v3.0) as published by the Free Software Foundation.',
          )}
        </p>
        <p>
          {i18n._(
            'Al-Azan is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.',
          )}
        </p>
        <p>
          {i18n._(
            'You should have received a copy of the GNU Affero General Public License along with this program. If not, see https://www.gnu.org/licenses/.',
          )}
        </p>
        <p>
          {i18n._(
            'The text found in this website and in the app may not be accurate in other languages, so in any case, only English version should be considered.',
          )}
        </p>
        <br />
        <br />
      </div>
    </section>
  );
}
