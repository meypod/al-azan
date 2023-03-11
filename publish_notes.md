# Configuring github CI/CD

## releasing

to release any type (pre-release/release), run `yarn np <version>`. don't prefix version with `v` letter, np automatically prefixes github tags with `v` letter.

**after each release don't forget to add fastlane metadata changelogs for current version code.**

## Generating key (once)

```
keytool -genkeypair -v -storetype PKCS12 -keystore azan_publish.keystore -alias azan_publish_alias -keyalg RSA -keysize 2048 -validity 10000
```

`validity` in days: 10000 ~= roughly 27 years

## Github Secrets

### ANDROID_SIGNING_KEY

add this env variable to the [gitlab secrets](https://github.com/meypod/al-azan/settings/secrets/actions) containing the base64 value of generated key:

```
openssl base64 < azan_publish.keystore  | tr -d '\n' | tee azan_publish.keystore.base64.txt
```

### ANDROID_ALIAS

The alias of your signing key, in this case `azan_publish_alias`.

### ANDROID_KEY_STORE_PASSWORD

The `keystore` password.

### ANDROID_KEY_PASSWORD

The `key` password. This will be same as `keystore` password since using `PKCS12` store type.

## screenshots

screenshots are made using "pixel 3" on android 13
