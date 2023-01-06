# Al-Azan

an open-source Adhan (أذان) - prayer times application built using react-native.

[<img src="https://fdroid.gitlab.io/artwork/badge/get-it-on.png"
     alt="Get it on F-Droid"
     height="80">](https://f-droid.org/packages/com.github.meypod.al_azan/)

or get the APK from [the Releases section](https://github.com/meypod/al-azan/releases/latest).

Apks released on GitHub are per CPU architecture, if you don't know which one to download, simply download the file that has "universal" in It's name.

## Features

* Ad-Free

* Doesn't use any kind of trackers

* Open-source

* You can search for your location online Or use GPS offline

* Set custom Adhan audio

* Select different Adhan audio for Fajr namaz

* In addition to five daily prayers, it has settings for Sunrise, Sunset, Midnight and Night Prayer (Tahajjud)

* Many options for Adhan (اذان) calculation

* Light/Dark theme

* Hide times you don't need

* Set reminders before or after a prayer time

* Homescreen and notification Widgets

* Is localized in English, Persian, Arabic, Turkish, Indonesian, French, Urdu, Hindi, German

## Screenshots

<table style="width:100%">
  <tr>
    <td><img src="https://raw.githubusercontent.com/meypod/al-azan/main/fastlane/metadata/android/en-US/images/phoneScreenshots/1-main-light.png"/></th>
    <td><img src="https://raw.githubusercontent.com/meypod/al-azan/main/fastlane/metadata/android/en-US/images/phoneScreenshots/2-main-dark.png"/></th>
    <td><img src="https://raw.githubusercontent.com/meypod/al-azan/main/fastlane/metadata/android/en-US/images/phoneScreenshots/6-homescreen-widget-light.png"/></th>
    <td><img src="https://raw.githubusercontent.com/meypod/al-azan/main/fastlane/metadata/android/en-US/images/phoneScreenshots/7-notification-widget-light.png"/></th>
  </tr>
</table>

## How to run this project

for development:

```bash
# 1. install packages
yarn install

# 2. build the debug version and launch emulator
yarn android

# 3. run the packager
yarn start

```

for creating a release build locally to debug:

```bash
cd android && ./gradlew :app:assembleRelease
```

to uninstall app while keeping data:

```bash
adb shell cmd package uninstall -k com.github.meypod.al_azan
```

## Translations

All translations are synced with [translation.io](https://translation.io/) with source code as single source of translation keys. it is synced during CI build for releases or when `lingui.config.js` file is configured and `yarn sync_and_purge` command is run.

### Translators

Translation to other languages has been done by these awesome people:

#### Turkish

* [@Serince](https://github.com/Serince)

#### Indonesian

* [@muava12](https://github.com/muava12)

#### French

* Contributor has chosen to stay anonymous

#### Urdu

* [Asjad Ahmad](https://twitter.com/Estcaliphate)

#### Hindi

* Contributor has chosen to stay anonymous

#### German

* [@b3r4t](https://github.com/b3r4t)

## Thanks to

react-native community members.

[Translation.io](https://translation.io/) (Lingui.js) for providing free services for open source projects.

[Geonames.org](https://www.geonames.org/) for providing search api for geocoding.

and many other library maintainers that I can't list them all.
