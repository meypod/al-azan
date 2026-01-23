# AI Agent Guide for Al-Azan

> **Quick Start**: This document provides essential information for AI agents to understand, use, and contribute to the Al-Azan project. For comprehensive technical documentation, see [PROJECT.md](./PROJECT.md).

## Project Overview

Al-Azan is an open-source Islamic prayer times (Adhan/أذان) Android application built with **React Native 0.74.5** and **TypeScript**. It provides accurate prayer time calculations, Qibla direction, customizable Adhan audio, and widgets.

**Current Version**: 1.17.10 (versionCode: 77)
**Package ID**: `com.github.meypod.al_azan`
**Platform**: Android-only
**License**: Open Source

## Essential Documentation

- **[PROJECT.md](./PROJECT.md)**: Complete technical documentation (architecture, APIs, data flows)
- **[README.md](./README.md)**: User-facing documentation and setup instructions
- **Code**: Well-organized TypeScript codebase with strict type checking

## Quick Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  React Native App (TypeScript + React 18.2.0)      │
│  ├─ Screens (UI)                                    │
│  ├─ Components (Reusable)                           │
│  ├─ Zustand Stores (State + MMKV persistence)      │
│  ├─ Tasks (Alarm scheduling, widgets)              │
│  └─ Native Modules (Android bridge)                 │
├─────────────────────────────────────────────────────┤
│  Native Android Layer (Java/Kotlin)                 │
│  ├─ MediaPlayer (Audio playback)                    │
│  ├─ Compass (Qibla direction)                       │
│  ├─ Widgets (Home screen + notification)            │
│  └─ Notifee (Rich notifications)                    │
└─────────────────────────────────────────────────────┘
```

## Key Directory Structure

```
src/
├── screens/              # Screen components (one per feature)
│   ├── home/            # Main prayer times screen
│   ├── settings/        # Settings screens
│   ├── qibla_finder/    # Qibla compass/map
│   └── qada_counter/    # Prayer counter
├── store/               # Zustand state management
│   ├── settings.ts      # App settings
│   ├── calculation.ts   # Prayer calculation params
│   ├── alarm.ts         # Alarm settings
│   └── reminder.ts      # Reminder settings
├── tasks/               # Background tasks
│   ├── set_next_adhan.ts   # Schedule next prayer
│   └── update_widgets.ts   # Update home widgets
├── modules/             # Native module bridges
│   ├── media_player.ts  # Audio playback control
│   └── compass.ts       # Compass sensor access
├── adhan/               # Prayer time calculations
├── components/          # Reusable UI components
├── utils/               # Utility functions
└── navigation/          # React Navigation setup

android/app/src/main/java/com/github/meypod/al_azan/
├── modules/             # Native modules (Java)
├── MainActivity.kt      # Main activity
├── AlarmActivity.java   # Fullscreen alarm
└── PrayerTimesWidget.java  # Home widget
```

## Coding Standards

### TypeScript
- **Strict mode enabled**: All type errors must be resolved
- **Path aliases**: Use `@/` for imports (e.g., `@/store/settings`)
- **Naming conventions**:
  - Components: `PascalCase.tsx`
  - Files: `snake_case.ts` or `camelCase.ts`
  - Constants: `UPPER_SNAKE_CASE`
  - Store properties: `UPPER_SNAKE_CASE`
  - Functions/variables: `camelCase`

### Code Style (ESLint + Prettier)
```typescript
// Bracket spacing: NEVER
const obj = {key: value}; // ✓ Good
const obj = { key: value }; // ✗ Bad

// Single quotes
const str = 'hello'; // ✓ Good

// Trailing commas everywhere
const arr = [1, 2, 3,]; // ✓ Good

// Arrow function parens: avoid when possible
const fn = x => x + 1; // ✓ Good
```

### Import Order (enforced by ESLint)
```typescript
// 1. React and React Native
import {useEffect} from 'react';
import {View, Text} from 'react-native';

// 2. External dependencies
import {Button} from 'native-base';
import {useStore} from 'zustand';

// 3. Internal imports (use @/ alias)
import {settings} from '@/store/settings';
import {playAudio} from '@/services/audio_service';
```

## State Management Pattern

All state is managed with **Zustand** + **MMKV** (fast key-value storage):

```typescript
// Using a store hook (preferred)
import {useSettings} from '@/store/settings';

function MyComponent() {
  const [theme, setTheme] = useSettings('SELECTED_THEME');
  // theme: 'light' | 'dark' | 'auto'
  // setTheme: (value) => void
}

// Or use Zustand directly
import {useStore} from 'zustand';
import {settings} from '@/store/settings';

function MyComponent() {
  const theme = useStore(settings, s => s.SELECTED_THEME);
  const setSetting = useStore(settings, s => s.setSetting);

  const handleChange = () => setSetting('SELECTED_THEME', 'dark');
}
```

### Key Stores
- **settings.ts**: Theme, locale, audio files, permissions
- **calculation.ts**: Location, prayer calculation method, adjustments
- **alarm.ts**: Per-prayer notification settings, vibration
- **reminder.ts**: Custom reminders before/after prayers
- **counter.ts**: Qada counter state

## Common Tasks Guide

### 1. Reading Prayer Times

```typescript
import {getPrayerTimes} from '@/adhan/prayer_times';
import {useStore} from 'zustand';
import {calcSettings} from '@/store/calculation';

// Get current prayer times
const settings = calcSettings.getState();
const prayerTimes = getPrayerTimes(new Date(), settings);
// Returns: {fajr, sunrise, dhuhr, asr, maghrib, isha, midnight, ...}
```

### 2. Scheduling Alarms

```typescript
import {setNextAdhan} from '@/tasks/set_next_adhan';

// Schedule next prayer alarm
await setNextAdhan();
// This reads from stores, calculates next prayer, and schedules via Notifee
```

### 3. Playing Audio

```typescript
import {playAudio} from '@/services/audio_service';
import {settings} from '@/store/settings';

const audioEntry = settings.getState().AUDIO_ENTRIES[0];
await playAudio({
  entry: audioEntry,
  stopOnNotificationRemoved: true,
  skipRingingCheck: false,
});
```

### 4. Updating Widgets

```typescript
import {updateWidgets} from '@/tasks/update_widgets';

// Update both home screen and notification widgets
await updateWidgets();
```

### 5. Working with Location

```typescript
import {calcSettings} from '@/store/calculation';

const location = calcSettings.getState().LOCATION;
// {latitude: number, longitude: number, label: string, ...}

calcSettings.getState().setSetting('LOCATION', {
  latitude: 40.7128,
  longitude: -74.0060,
  label: 'New York, US',
});
```

## Development Workflow

### Setup
```bash
# 1. Clone with submodules
git clone --recurse-submodules git@github.com:meypod/al-azan.git
cd al-azan

# 2. Install dependencies
yarn install

# 3. Setup lingui (copy example config)
cp lingui.config.js.example lingui.config.js

# 4. Compile translations
yarn lingui compile
```

### Running
```bash
# Start Metro bundler
yarn start

# Build and run debug APK
yarn android

# View logs
yarn log

# Run tests
yarn test

# Lint and fix
yarn lint-fix
```

### Building Release
```bash
cd android
./gradlew :app:assembleRelease -PnoSign -PuseLegacyPackaging=true
# Output: android/app/build/outputs/apk/release/
```

## Key Patterns to Follow

### 1. Component Structure
```typescript
import {useEffect, useCallback} from 'react';
import {View} from 'react-native';

export function MyScreen(): React.JSX.Element {
  // 1. Hooks (state, store, navigation)
  const [state, setState] = useState();

  // 2. Effects
  useEffect(() => {
    // side effects
  }, [dependencies]);

  // 3. Handlers (use useCallback)
  const handlePress = useCallback(() => {
    // logic
  }, [dependencies]);

  // 4. Render
  return <View>{/* JSX */}</View>;
}
```

### 2. Store Actions (Use Immer)
```typescript
import {produce} from 'immer';

// In store definition
setSetting: (key, value) =>
  set(
    produce<SettingsStore>(draft => {
      draft[key] = value;
    }),
  ),
```

### 3. Internationalization
```typescript
import {t, Trans} from '@lingui/macro';

// In code
const message = t`Next prayer`;

// In JSX
<Trans>Settings</Trans>
```

## Native Modules Reference

### MediaPlayerModule
```typescript
import {MediaPlayerModule} from '@/modules/media_player';

// Setup and play
MediaPlayerModule.setupPlayer();
MediaPlayerModule.setDataSource({uri: 'file://...'});
MediaPlayerModule.start();

// Listen to events
MediaPlayerModule.addListener('completed', () => {
  console.log('Playback finished');
});
```

### CompassModule
```typescript
import {CompassModule} from '@/modules/compass';

// Start compass with sensitivity
CompassModule.start(1); // 1 = normal, 2 = UI, 3 = game

// Listen to heading updates
CompassModule.addListener('heading', (data) => {
  console.log('Heading:', data.heading);
});
```

## Testing Strategy

```bash
# Run all tests
yarn test

# Run specific test
yarn test --testPathPattern=prayer_times

# Watch mode
yarn test --watch

# Coverage
yarn test --coverage
```

Test files: `*.test.ts`, `*.test.tsx` alongside source files.

## Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push and create PR
git push origin feature/my-feature
```

**Commit Message Format**: Follow conventional commits
- `feat:` New feature
- `fix:` Bug fix
- `chore:` Maintenance
- `docs:` Documentation
- `refactor:` Code refactoring

## Important Constraints

### What to AVOID
- **No iOS code**: This is Android-only
- **No backward compatibility hacks**: Clean up unused code
- **No over-engineering**: Keep solutions simple
- **No security vulnerabilities**: Check for XSS, injection, etc.
- **No bundled large files**: Audio files are referenced, not bundled
- **No breaking API changes**: Without version migration

### What to CHECK
- ✓ TypeScript compiles without errors
- ✓ ESLint passes (`yarn lint`)
- ✓ Tests pass (`yarn test`)
- ✓ Android build succeeds
- ✓ Translations extracted if strings changed (`yarn lingui extract`)
- ✓ No console.logs in production (removed by Babel)

## Troubleshooting

### Clean Build
```bash
# Clear everything
cd android && ./gradlew clean
yarn start --reset-cache
rm -rf node_modules && yarn install
```

### Common Issues
1. **Native module not found**: Rebuild with `yarn android`
2. **Gradle build fails**: Check Java version (needs 17)
3. **Metro bundler errors**: Clear cache with `--reset-cache`
4. **Translation errors**: Run `yarn lingui compile`

## Key Dependencies

- **React Native**: 0.74.5 (Android-only)
- **Zustand**: 4.3.9 (State management)
- **MMKV**: 2.12.2 (Fast storage)
- **Notifee**: 7.8.2 (Notifications)
- **adhan-extended**: 6.1.0 (Prayer times)
- **Lingui**: 3.17.2 (i18n)
- **MapLibre**: 10.0.0-alpha.10 (Maps)
- **Native Base**: 3.4.27 (UI components)

## Performance Considerations

- **Prayer time caching**: Times cached daily in `adhan_calc_cache` store
- **Widget updates**: Minimized to date changes and setting changes
- **Audio playback**: Native MediaPlayer for low latency
- **Storage**: MMKV for fast synchronous storage
- **Optimization**: Use `React.memo()`, `useCallback`, `useMemo`

## Resources

- **Full Documentation**: [PROJECT.md](./PROJECT.md) (1400+ lines)
- **User Guide**: [README.md](./README.md)
- **GitHub Repo**: https://github.com/meypod/al-azan
- **Issues**: https://github.com/meypod/al-azan/issues
- **Translation**: https://translation.io/

## Questions or Issues?

1. **Check [PROJECT.md](./PROJECT.md)** for detailed technical documentation
2. **Search existing issues** on GitHub
3. **Read the source code** - it's well-documented TypeScript
4. **Check tests** for usage examples

## Contributing Checklist

Before submitting changes:

- [ ] Code compiles with no TypeScript errors
- [ ] ESLint passes (`yarn lint-fix`)
- [ ] Tests pass (`yarn test`)
- [ ] Strings extracted if UI text changed (`yarn lingui extract`)
- [ ] Android build succeeds (`yarn android`)
- [ ] No console.logs in production code
- [ ] No security vulnerabilities introduced
- [ ] Changes tested on physical device (if UI/notification changes)
- [ ] Commit message follows conventional format
- [ ] PR description explains what and why

---

**For AI Agents**: This project has a well-structured codebase with clear separation of concerns. When making changes:
1. Always read relevant code first before modifying
2. Follow existing patterns (stores, components, tasks)
3. Respect TypeScript types strictly
4. Test changes thoroughly
5. Update documentation if adding new features

**Last Updated**: 2026-01-23
