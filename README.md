# Al-Azan

an open-source Adhan (أذان) - prayer times application built using react-native.

[<img src="https://fdroid.gitlab.io/artwork/badge/get-it-on.png"
     alt="Get it on F-Droid"
     height="80">](https://f-droid.org/packages/com.github.meypod.al_azan/)
[<img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
     alt='Get it on Google Play'
     height="80">](https://play.google.com/store/apps/details?id=com.github.meypod.al_azan)

or get the APK from [the Releases section](https://github.com/meypod/al-azan/releases/latest).

Apks released on GitHub are per CPU architecture, if you don't know which one to download, simply download the file that has "universal" in It's name.

## Features

* Ad-Free

* Doesn't use any kind of trackers

* Open-source

* You can search for your location offline Or use GPS

* Set custom Adhan audio

* Select different Adhan audio for Fajr namaz

* In addition to five daily prayers, it has settings for Sunrise, Sunset, Midnight and Night Prayer (Tahajjud)

* Many options for Adhan (اذان) calculation

* Light and Dark theme

* Hide times you don't need

* Set reminders before or after a prayer time

* Homescreen and notification Widgets

* Qibla finder

* Qada counter

* Is localized in English, Persian, Arabic, Turkish, Indonesian, French, Urdu, Hindi, German, Bosnian, Vietnamese, Bangla

## Screenshots

<table style="width:100%">
  <tr>
    <td><img src="https://raw.githubusercontent.com/meypod/al-azan/main/fastlane/metadata/android/en-US/images/phoneScreenshots/1-main-light.png"/></th>
    <td><img src="https://raw.githubusercontent.com/meypod/al-azan/main/fastlane/metadata/android/en-US/images/phoneScreenshots/2-main-dark.png"/></th>
    <td><img src="https://raw.githubusercontent.com/meypod/al-azan/main/fastlane/metadata/android/en-US/images/phoneScreenshots/9-homescreen-widget-light.png"/></th>
    <td><img src="https://raw.githubusercontent.com/meypod/al-azan/main/fastlane/metadata/android/en-US/images/phoneScreenshots/8-notification-widget-light.png"/></th>
  </tr>
</table>

## How to run this project

Requirements:

* Node >= 16
* Android SDK
* Yarn

1. Clone the project:

```bash
# clone with submodules
git clone --recurse-submodules git@github.com:meypod/al-azan.git

# OR if you have already cloned the repo without `--recurse-submodules`, update git submodule:
cd al-azan && git submodule update --init --recursive
```

2. install packages:

```bash
yarn install
```

3. Prepare language settings by renaming `lingui.config.js.example` to `lingui.config.js`.

4. Compile the languages:

```bash
# need to do only once, or when you sync the translations
yarn lingui compile
```

for development:

```bash
# 1. run the packager
yarn start

# 2. build the debug version and launch emulator
yarn android
```

for creating a release build locally to debug:

```bash
# start the build
yarn android --variant=release
# OR run:
cd android && ./gradlew :app:assembleRelease
```

to uninstall app while keeping data:

```bash
adb shell cmd package uninstall -k com.github.meypod.al_azan
```

## Translations

All translations are synced with [translation.io](https://translation.io/) with source code as single source of translation keys. It is only compiled during CI build for releases. Syncing is done manually when `lingui.config.js` file is configured and `yarn sync_and_purge` command is run.

### Contributing your language

Please follow instructions commented [here](https://github.com/meypod/al-azan/issues/9#issuecomment-1260365126).

### Translators

Translation to other languages has been done by these awesome people:

#### Turkish

* [@Serince](https://github.com/Serince)
* [Muha Aliss](https://github.com/muhaaliss)

#### Indonesian

* [@muava12](https://github.com/muava12)

#### French

* First Contributor has chosen to stay anonymous
* [@programer786](https://github.com/programer00112)

#### Urdu

* [Asjad Ahmad](https://twitter.com/Estcaliphate)

#### Hindi

* Contributor has chosen to stay anonymous

#### German

* [@b3r4t](https://github.com/b3r4t)

#### Bosnian

* [@SecularSteve](https://github.com/SecularSteve)

#### Vietnamese

* [Bach Nguyen](https://github.com/techyescountry)

#### Arabic

* [@M86xKC](https://github.com/M86xKC)

#### Bangla

* [Samin Yaser](https://github.com/SaminYaser-work)

## Thanks to

All of people who have helped this project grow.

[Adhan-js](https://github.com/batoulapps/adhan-js) for providing the prayer times library.

React-native community members.

[Translation.io](https://translation.io/) (Lingui.js) for providing free translation services for open source projects.

[Geonames.org](https://www.geonames.org/) for providing data for geocoding.

[Openstreetmap.org](https://www.openstreetmap.org/copyright) and [Libremap](https://github.com/maplibre/maplibre-react-native) for providing the map.

[Google Material Icons](https://fonts.google.com/icons) for the icons.

and many other library maintainers that I can't list them all.

## Donate

Donations are appreciated. But I can only accept in crypto, here are my wallet addresses:

Bitcoin:
bc1q2y6fng33tzhc8qefsy2pht057q2rmfx09qyx6v

Ethereum:
0x1a1407f549cb52658a3ed6Eac9C5e850dED4DB2b

Solana:
CBK8ySxbVWrCkb1CQYoR1jYa4hEiMgpnVfJjGLCfBSJ1

Litecoin:
Lbgz2X6TG9ANLGamNpdmhyoMc4q4wBHaVQ

Tron:
THjtLAdihH57mbeaVmBfx3wAAXkpxAnqmJ

Bitcoin cash:
qqgjknfejs4zf4udsalsej2qkwt5es5ym5fwusgvx3
