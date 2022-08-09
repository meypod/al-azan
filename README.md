# Al-Azan

an open-source adhan - prayer times application built using react-native.

## How to run this project

It's important to note that this project uses [re-pack](https://github.com/callstack/repack)(webpack) to bundle the files, to be able to provide chunking and lazy imports. So running it is a little bit different.

for development:

```bash
# 1. install packages
yarn install

# 2. build the debug version and launch emulator
yarn android

# 3. run the packager
yarn start

```

for creating a release build:

```bash
cd android && ./gradlew build -PnoDebug
```

## Translations

All translations are synced with [translation.io](https://translation.io/) with source code as single source of translation keys. it is only synced during CI build or when `lingui.config.js` file is configured and `yarn sync_and_purge` command is run.

## Thanks to

react-native community members.

[Translation.io](https://translation.io/) (Lingui.js) for providing free services for open source projects.

[Geonames.org](https://www.geonames.org/) for providing search api for geocoding.

and many other library maintainers that I can't list them all.

## LICENSE

No one is allowed to make any derivitive work that contains any in-app purchases or ads. Anything else should follow the license mentioned in the `LICENSE` file.

At the end It would be better to contribute to this project to make it better.
