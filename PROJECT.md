# Al-Azan Project Documentation
 
## Table of Contents
 
1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Project Architecture](#project-architecture)
4. [Directory Structure](#directory-structure)
5. [State Management](#state-management)
6. [Data Flow](#data-flow)
7. [Native Modules](#native-modules)
8. [Key Features Implementation](#key-features-implementation)
9. [Notification System](#notification-system)
10. [Internationalization](#internationalization)
11. [Coding Standards](#coding-standards)
12. [Build Process](#build-process)
13. [Testing](#testing)
14. [Deployment](#deployment)
15. [Development Workflow](#development-workflow)
 
---
 
## Project Overview
 
**Al-Azan** is an open-source Islamic prayer times (Adhan/أذان) application built using React Native for Android. The application provides accurate prayer time calculations, Qibla direction finder, customizable Adhan audio, prayer reminders, homescreen widgets, and a Qada counter for tracking missed prayers.
 
### Key Characteristics
 
- **Platform**: Android-only (React Native 0.74.5)
- **Language**: TypeScript (strict mode)
- **Version**: 1.17.10 (versionCode: 77)
- **Package ID**: `com.github.meypod.al_azan`
- **License**: Open Source
- **Distribution**: F-Droid, Google Play Store, GitHub Releases
 
### Core Features
 
- Ad-free and tracker-free
- Offline location search with GPS support
- Custom Adhan audio per prayer
- Multiple calculation methods
- Light/Dark theme support
- Reminders before/after prayer times
- Homescreen and notification widgets
- Qibla finder (compass and map)
- Qada counter for missed prayers
- Multilingual support (12+ languages)
 
---
 
## Technical Stack
 
### Frontend Framework
 
- **React Native**: 0.74.5
- **React**: 18.2.0
- **TypeScript**: 5.0.4
- **Native Base**: 3.4.27 (UI component library)
 
### State Management
 
- **Zustand**: 4.3.9 (lightweight state management)
- **Immer**: 10.0.3 (immutable state updates)
- **MMKV**: 2.12.2 (fast key-value storage)
 
### Navigation
 
- **React Navigation**: 6.1.18
- **React Navigation Native Stack**: 6.11.0
 
### Prayer Time Calculations
 
- **adhan-extended**: 6.1.0 (Islamic prayer time calculations library)
 
### Notifications
 
- **Notifee**: 7.8.2 (local notifications and scheduling)
 
### Maps & Location
 
- **MapLibre React Native**: 10.0.0-alpha.10 (map rendering)
- **react-native-get-location**: 2.2.1 (GPS access)
 
### Audio
 
- Custom native Android MediaPlayer module
 
### Internationalization
 
- **Lingui**: 3.17.2 (i18n framework)
- **Translation.io**: External translation service integration
 
### Utilities
 
- **lodash**: 4.17.21
- **fuse.js**: 6.6.2 (fuzzy search for location)
- **hash.js**: 1.1.7 (settings hash generation)
- **rtl-detect**: 1.1.2 (RTL language detection)
 
### Build Tools
 
- **Babel**: Custom configuration with macros and module resolver
- **Metro**: React Native bundler
- **Gradle**: Android build system
- **Hermes**: JavaScript engine (with internationalization support)
 
### Code Quality
 
- **ESLint**: 8.32.0 with TypeScript, React, and Prettier plugins
- **Prettier**: 2.8.8
- **TypeScript**: Strict mode enabled
 
### Testing
 
- **Jest**: 29.6.3
- **React Test Renderer**: 18.2.0
- **Testing Library React Hooks**: 8.0.0
 
---
 
## Project Architecture
 
### High-Level Architecture
 
The application follows a **unidirectional data flow** pattern with clear separation of concerns:
 
```
┌─────────────────────────────────────────────────────────────┐
│                       React Native App                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Screens    │◄───┤  Navigation  │    │  Components  │  │
│  │ (UI Layers)  │    │   (Router)   │    │  (Reusable)  │  │
│  └──────┬───────┘    └──────────────┘    └──────────────┘  │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          State Management (Zustand Stores)            │  │
│  │  • settings  • calculation  • alarm  • reminder       │  │
│  │  • counter   • favorite_locations  • monthly_view     │  │
│  └──────┬───────────────────────────────────────────────┘  │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Business Logic Layer                     │  │
│  │  • tasks/     (scheduling, widgets, alarms)           │  │
│  │  • services/  (audio playback)                        │  │
│  │  • utils/     (date, permissions, formatting)         │  │
│  └──────┬───────────────────────────────────────────────┘  │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Native Modules (Android Bridge)            │  │
│  │  • MediaPlayer  • Compass  • ScreenWidget             │  │
│  │  • NotificationWidget  • Activity                     │  │
│  └──────┬───────────────────────────────────────────────┘  │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Android Native Layer                      │
│  • Java/Kotlin Modules  • Android Services                   │
│  • BroadcastReceivers  • Widgets  • Activities               │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Persistent Storage                        │
│  • MMKV (key-value store)  • File System (audio files)       │
└─────────────────────────────────────────────────────────────┘
```
 
### Application Entry Points
 
The application has **two main entry points** defined in `index.tsx`:
 
1. **main-app**: The primary application interface
2. **fs-alarm**: Fullscreen alarm activity (shown when Adhan plays)
 
Both entry points bootstrap the application, load locale settings, and initialize the React Native runtime.
 
### Architectural Patterns
 
1. **Component-Based UI**: React components with Native Base for consistent styling
2. **Store-Based State**: Zustand stores with MMKV persistence
3. **Task-Based Scheduling**: Separate task modules for alarm/reminder scheduling
4. **Bridge Pattern**: Native modules expose Android functionality to React Native
5. **Observer Pattern**: Event emitters for native events (media player, compass)
6. **Strategy Pattern**: Multiple calculation methods for prayer times
 
---
 
## Directory Structure
 
```
al-azan/
├── android/                    # Android native code
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/github/meypod/al_azan/
│   │   │   │   ├── modules/              # Native bridge modules
│   │   │   │   │   ├── MediaPlayerModule.java
│   │   │   │   │   ├── CompassModule.java
│   │   │   │   │   ├── ScreenWidgetModule.java
│   │   │   │   │   ├── NotificationWidgetModule.java
│   │   │   │   │   └── ActivityModule.java
│   │   │   │   ├── utils/                # Native utilities
│   │   │   │   ├── MainActivity.kt       # Main activity
│   │   │   │   ├── MainApplication.kt    # Application class
│   │   │   │   ├── AlarmActivity.java    # Fullscreen alarm
│   │   │   │   ├── PrayerTimesWidget.java # Home widget
│   │   │   │   └── WidgetChangeReceiver.java
│   │   │   ├── res/                      # Android resources
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   └── build.gradle
├── src/                        # React Native source code
│   ├── adhan/                  # Prayer time calculation logic
│   │   ├── index.ts
│   │   ├── prayer.ts
│   │   ├── prayer_times.ts
│   │   └── calculation_methods.ts
│   ├── assets/                 # Static assets
│   │   ├── adhan_entries.ts    # Bundled Adhan audio metadata
│   │   ├── compass/            # Compass images
│   │   ├── geocoding/          # Offline location database
│   │   ├── icons/              # Material icons
│   │   ├── logo/               # App logo
│   │   └── sounds/             # Default Adhan sounds
│   ├── components/             # Reusable React components
│   │   ├── AudioPicker.tsx
│   │   ├── PrayerTimeRow.tsx
│   │   ├── AutocompleteInput.tsx
│   │   └── ...
│   ├── constants/              # App constants
│   │   └── notification.ts
│   ├── modules/                # Native module interfaces
│   │   ├── media_player.ts     # Media player bridge
│   │   ├── compass.ts          # Compass bridge
│   │   ├── screen_widget.ts    # Screen widget bridge
│   │   ├── notification_widget.ts
│   │   └── activity.ts         # Activity helpers
│   ├── navigation/             # Navigation configuration
│   │   ├── index.tsx
│   │   ├── root_navigation.ts
│   │   └── types.ts
│   ├── screens/                # Screen components
│   │   ├── home/               # Main screen
│   │   ├── intro/              # Onboarding
│   │   ├── settings/           # Settings screens
│   │   ├── settings_*/         # Various settings sub-screens
│   │   ├── qibla_finder/       # Qibla finder
│   │   ├── qibla_finder_compass/
│   │   ├── qibla_finder_map/
│   │   ├── qada_counter/       # Prayer counter
│   │   ├── monthly_view/       # Calendar view
│   │   ├── fullscreen_alarm/   # Fullscreen alarm
│   │   └── favorite_locations/
│   ├── services/               # Business services
│   │   ├── audio_service.ts    # Audio playback
│   │   └── play_sound.ts
│   ├── store/                  # Zustand state stores
│   │   ├── settings.ts         # App settings
│   │   ├── calculation.ts      # Calculation settings
│   │   ├── alarm.ts            # Alarm settings
│   │   ├── reminder.ts         # Reminder settings
│   │   ├── counter.ts          # Qada counter
│   │   ├── favorite_locations.ts
│   │   ├── monthly_view.ts
│   │   ├── adhan_calc_cache.ts # Prayer time cache
│   │   ├── mmkv.ts             # Storage adapter
│   │   └── simple.ts           # Simple non-persistent store
│   ├── tasks/                  # Background task logic
│   │   ├── set_next_adhan.ts   # Schedule next prayer alarm
│   │   ├── set_reminder.ts     # Schedule reminders
│   │   ├── set_alarm.ts        # Generic alarm setter
│   │   ├── set_pre_alarm.ts    # Pre-alarm scheduling
│   │   ├── cancel_alarms.ts    # Cancel scheduled alarms
│   │   ├── update_widgets.ts   # Update home widgets
│   │   └── set_update_widgets_alarms.ts
│   ├── theme/                  # Theme configuration
│   ├── utils/                  # Utility functions
│   │   ├── hooks/              # React hooks
│   │   ├── date.ts             # Date formatting
│   │   ├── locale.ts           # Locale utilities
│   │   ├── permission.ts       # Permission checks
│   │   ├── geonames.ts         # Location types
│   │   └── ...
│   ├── app.tsx                 # Main app component
│   ├── bootstrap.ts            # App initialization
│   ├── base_component.tsx      # Base component wrapper
│   ├── i18n.ts                 # i18n loader
│   ├── i18n_base.ts            # i18n base config
│   └── notifee.ts              # Notification handlers
├── locales/                    # Translation files
│   ├── en/
│   ├── ar/
│   ├── fa/
│   ├── tr/
│   └── ...
├── fastlane/                   # Deployment automation
│   ├── metadata/               # Store metadata
│   └── update/                 # Update scripts
├── .github/                    # GitHub workflows
│   └── workflows/
│       ├── build_and_deploy.yml
│       ├── tests.yml
│       └── ...
├── patches/                    # NPM package patches
├── index.tsx                   # App entry point
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── babel.config.js             # Babel config
├── metro.config.js             # Metro bundler config
├── jest.config.js              # Jest test config
├── .eslintrc.js                # ESLint config
├── .prettierrc.js              # Prettier config
└── README.md                   # Project readme
```
 
---
 
## State Management
 
### Zustand Store Architecture
 
The application uses **Zustand** for state management with **MMKV** as the storage backend for persistence. All stores follow a consistent pattern:
 
#### Store Files (src/store/)
 
1. **settings.ts**: Global app settings
2. **calculation.ts**: Prayer calculation parameters
3. **alarm.ts**: Alarm/notification settings
4. **reminder.ts**: Custom reminder settings
5. **counter.ts**: Qada counter state
6. **favorite_locations.ts**: Saved locations
7. **monthly_view.ts**: Calendar view preferences
8. **adhan_calc_cache.ts**: Cached prayer times
9. **home.ts**: Home screen state
 
### Store Pattern
 
Each store follows this structure:
 
```typescript
// 1. Define the store type
export type SettingsStore = {
  // State properties
  PROPERTY_NAME: Type;
 
  // Computed properties
  computed: {
    computedValue: Type;
  };
 
  // Actions
  setSetting: (key, value) => void;
  customAction: () => void;
};
 
// 2. Create the store with persistence
export const settings = createStore<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      PROPERTY_NAME: defaultValue,
 
      // Computed getters
      computed: {
        get computedValue() {
          return /* computed logic */;
        },
      },
 
      // Actions using Immer for immutability
      setSetting: (key, value) =>
        set(
          produce<SettingsStore>(draft => {
            draft[key] = value;
          }),
        ),
    }),
    {
      name: 'STORAGE_KEY',
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
      migrate: (persistedState, version) => {
        // Migration logic for version updates
      },
    },
  ),
);
 
// 3. Export convenience hook
export function useSettings<T>(key: T) {
  const state = useStore(settings, s => s[key]);
  const setSetting = useStore(settings, s => s.setSetting);
  const setCallback = useCallback(
    (val) => setSetting(key, val),
    [key, setSetting],
  );
  return [state, setCallback];
}
```
 
### MMKV Storage Adapter
 
Located in `src/store/mmkv.ts`, provides fast synchronous storage:
 
```typescript
export const storage = new MMKV();
 
export const zustandStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.delete(name),
};
```
 
### Key Stores Overview
 
#### settings.ts
- Theme preferences (light/dark/auto)
- Locale and calendar settings
- Audio entries (saved Adhan files)
- Hidden prayers
- Widget configuration
- Permission states
- Developer mode
- Delivered alarm timestamps
 
#### calculation.ts
- Location (lat/long, city, country)
- Calculation method
- High latitude rules
- Madhab (Asr calculation)
- Shafaq, Polar resolution
- Angle overrides (Fajr, Isha, Maghrib)
- Per-prayer time adjustments
- Hijri calendar adjustments
 
#### alarm.ts
- Per-prayer notification settings (sound/silent)
- Vibration mode
- Screen wake settings
- "Show next prayer" option
 
#### reminder.ts
- Custom reminders (before/after prayers)
- Days of week selection
- Duration before/after
- Once vs. repeated reminders
 
---
 
## Data Flow
 
### Prayer Time Calculation Flow
 
```
User Location/Settings Change
        ↓
calcSettings.setSetting() / calcSettings.LOCATION
        ↓
src/adhan/prayer_times.ts → calculatePrayerTimes()
        ↓
adhan-extended library (external)
        ↓
Apply adjustments from calcSettings
        ↓
Cache result in adhan_calc_cache store
        ↓
Display in UI + Schedule Alarms
```
 
### Alarm Scheduling Flow
 
```
Prayer Time Calculated / Settings Changed
        ↓
tasks/set_next_adhan.ts → setNextAdhan()
        ↓
getNextPrayer() → determines upcoming prayer
        ↓
setAlarmTask() → schedules via Notifee
        ↓
setPreAlarmTask() → schedules pre-notification
        ↓
Notifee → Android AlarmManager
        ↓
Alarm triggers at scheduled time
        ↓
notifee.ts → handleNotification()
        ↓
services/audio_service.ts → playAudio()
        ↓
modules/media_player.ts → MediaPlayerModule (native)
        ↓
Android MediaPlayer plays sound
```
 
### Widget Update Flow
 
```
Date/Time Change OR Settings Change
        ↓
tasks/update_widgets.ts → updateWidgets()
        ↓
Calculate current/next prayer times
        ↓
modules/screen_widget.ts → updateScreenWidget()
        ↓
ScreenWidgetModule (native bridge)
        ↓
Android PrayerTimesWidget updates RemoteViews
        ↓
Widget UI refreshes on home screen
```
 
### Notification Event Flow
 
```
Notification Triggered
        ↓
notifee.ts → setupNotifeeHandlers()
        ↓
onBackgroundEvent / onForegroundEvent
        ↓
handleNotification() → parses event type
        ↓
├─ DELIVERED: Save timestamp, play sound/vibrate
├─ DISMISSED: Cancel notification, stop audio
├─ ACTION_PRESS: Handle action buttons
└─ TRIGGER_NOTIFICATION_CREATED: Setup notification
        ↓
Update next alarm / reminders / widgets
```
 
---
 
## Native Modules
 
### Overview
 
Native modules bridge Android functionality to React Native. All modules are located in:
- Native: `android/app/src/main/java/com/github/meypod/al_azan/modules/`
- JavaScript: `src/modules/`
 
### MediaPlayerModule
 
**Purpose**: Control audio playback for Adhan
 
**Native**: `MediaPlayerModule.java`, `MediaPlayerService.java`
**JS Bridge**: `src/modules/media_player.ts`
 
**Capabilities**:
- Setup/destroy MediaPlayer
- Play/pause/stop audio
- Set volume
- Set data source (local or external device)
- Get playback state
- Listen to events (completed, error, state change)
- Get system ringtones
- Handle volume button press (headless task)
 
**Key Methods**:
```java
setupPlayer()
start()
stop()
pause()
setVolume(value)
setDataSource(options)
getState()
getRingtones()
```
 
**Events**:
- `state`: Playback state changed
- `completed`: Playback finished
- `error`: Playback error
- `audio_focus_change`: Audio focus changed
 
### CompassModule
 
**Purpose**: Access device compass/magnetometer for Qibla direction
 
**Native**: `CompassModule.java`
**JS Bridge**: `src/modules/compass.ts`
 
**Capabilities**:
- Start/stop compass sensor
- Get magnetic heading
- Get orientation (portrait/landscape/reverse)
 
**Key Methods**:
```java
start(gain)
stop()
```
 
**Events**:
- `heading`: Compass heading update
 
### ScreenWidgetModule
 
**Purpose**: Update home screen widget
 
**Native**: `ScreenWidgetModule.java`
**JS Bridge**: `src/modules/screen_widget.ts`
 
**Capabilities**:
- Update widget with prayer times
- Request widget update
 
**Key Methods**:
```java
updateScreenWidget(options)
```
 
**Events**:
- `requested`: Widget update requested
 
### NotificationWidgetModule
 
**Purpose**: Update persistent notification widget
 
**Native**: `NotificationWidgetModule.java`
**JS Bridge**: `src/modules/notification_widget.ts`
 
**Capabilities**:
- Show/hide notification widget
- Update notification with prayer times
 
**Key Methods**:
```java
updateNotification(options)
```
 
### ActivityModule
 
**Purpose**: Access Android activity features
 
**Native**: `ActivityModule.java`
**JS Bridge**: `src/modules/activity.ts`
 
**Capabilities**:
- Vibrate device
- Check Do Not Disturb status
- Request permissions
- Set orientation lock
- Handle demo commands
 
**Key Methods**:
```java
vibrate(mode)
vibrateStop()
isDndActive()
setOrientationLock(orientation)
requestPermission(permission)
```
 
---
 
## Key Features Implementation
 
### 1. Prayer Time Calculation
 
**Location**: `src/adhan/`
 
The application uses the `adhan-extended` library with customizable parameters:
 
- **Calculation Methods**: Multiple methods (MWL, ISNA, Egyptian, etc.)
- **High Latitude Rules**: Angle-based, 1/7th night, middle of night
- **Madhab**: Shafi (shadow = 1) or Hanafi (shadow = 2) for Asr
- **Adjustments**: Per-prayer minute adjustments
- **Caching**: Prayer times cached daily to optimize performance
 
**Key Functions** (`src/adhan/prayer_times.ts`):
- `calculatePrayerTimes()`: Core calculation
- `getPrayerTimes()`: Get times for specific date
- `getCurrentPrayer()`: Get current prayer
- `getNextPrayer()`: Get next upcoming prayer
 
### 2. Notification & Alarm System
 
**Location**: `src/tasks/`, `src/notifee.ts`
 
Uses **Notifee** library for rich local notifications:
 
- **Channels**: Separate channels for Adhan, reminders (normal + DND-override)
- **Scheduled Alarms**: Uses Android AlarmManager
- **Foreground Service**: For playing audio uninterrupted
- **Actions**: Dismiss, snooze, cancel upcoming
- **Pre-alarms**: Warning notification before actual alarm
 
**Alarm Types**:
- `SET_ALARM_CLOCK`: Default, high priority
- `SET_EXACT_AND_ALLOW_WHILE_IDLE`: For adaptive charging compatibility
 
### 3. Audio Playback
 
**Location**: `src/services/audio_service.ts`, `src/modules/media_player.ts`
 
Custom implementation using Android MediaPlayer:
 
- **Audio Entries**: Bundled Adhan files + user-added custom files
- **Per-prayer Audio**: Different Adhan for each prayer (e.g., Fajr)
- **Loop Support**: Configurable looping
- **External Device**: Option to prefer external speakers/bluetooth
- **Volume Control**: Per-alarm volume setting
- **Phone State**: Automatically mutes if call is active
 
### 4. Widgets
 
**Location**: `android/app/src/main/java/.../PrayerTimesWidget.java`, `src/tasks/update_widgets.ts`
 
Two types of widgets:
 
1. **Home Screen Widget**: Shows next prayer and times
2. **Notification Widget**: Persistent notification with prayer times
 
**Update Triggers**:
- Date/time change (midnight, DATE_CHANGED broadcast)
- Location/calculation settings change
- Alarm delivered
 
### 5. Qibla Finder
 
**Location**: `src/screens/qibla_finder_compass/`, `src/screens/qibla_finder_map/`
 
Two modes:
 
1. **Compass Mode**: Real-time compass with Qibla direction
2. **Map Mode**: MapLibre map showing Qibla line from user location to Mecca
 
**Calculation**: Uses location coordinates to calculate bearing to Kaaba (21.4225°N, 39.8262°E)
 
### 6. Qada Counter
 
**Location**: `src/screens/qada_counter/`, `src/store/counter.ts`
 
Tracks missed prayers by type with:
- Add/subtract counters
- History tracking
- Total count display
- Editable counters
 
### 7. Location Management
 
**Location**: `src/assets/geocoding/`, `src/screens/settings_location/`
 
- **Offline Database**: Geonames database bundled with app
- **Search**: Fuzzy search using Fuse.js
- **GPS**: react-native-get-location for GPS coordinates
- **Favorites**: Save frequently used locations
 
### 8. Backup & Restore
 
**Location**: `src/screens/settings_backup/`
 
Export/import all settings as JSON file:
- All Zustand store states
- Custom audio file references
- Calculation settings
- Reminders and alarms
 
---
 
## Notification System
 
### Channel Configuration
 
The app uses multiple notification channels with different priorities:
 
**Channels** (`src/constants/notification.ts`):
1. `ADHAN_CHANNEL_ID`: Normal Adhan notifications
2. `ADHAN_DND_CHANNEL_ID`: Adhan that bypasses DND
3. `REMINDER_CHANNEL_ID`: Normal reminders
4. `REMINDER_DND_CHANNEL_ID`: Reminders that bypass DND
5. `PRE_ADHAN_CHANNEL_ID`: Pre-notification warnings
6. `PRE_REMINDER_CHANNEL_ID`: Pre-reminder warnings
7. `WIDGET_CHANNEL_ID`: Persistent notification widget
8. `WIDGET_UPDATE_CHANNEL_ID`: Internal widget updates
9. `IMPORTANT_CHANNEL_ID`: Important app notices
 
### Notification Actions
 
Notifications can have action buttons:
- **Dismiss**: Stop audio and remove notification
- **Cancel**: Cancel upcoming related alarm
 
### Notification Data
 
Each notification carries metadata in `data` field:
```typescript
{
  options: JSON.stringify({
    notifId: string;
    notifChannelId: string;
    date: Date;
    title: string;
    body: string;
    sound: AudioEntry;
    prayer: Prayer;
    vibrationMode: VibrationMode;
    intrusive: boolean;
    // ... more
  })
}
```
 
### Event Handling
 
All notification events handled in `src/notifee.ts`:
- **DELIVERED**: Notification shown to user
- **PRESS**: User tapped notification
- **ACTION_PRESS**: User tapped action button
- **DISMISSED**: User dismissed notification
- **FG_ALREADY_EXIST**: Foreground service already running
- **TRIGGER_NOTIFICATION_CREATED**: Scheduled notification created
 
---
 
## Internationalization
 
### Framework: Lingui.js
 
**Configuration**: `lingui.config.js` (needs TRANSLATION_IO_APIKEY)
 
**Supported Locales** (`locales/`):
- English (en)
- Persian (fa)
- Arabic (ar)
- Turkish (tr)
- Indonesian (id)
- French (fr)
- Urdu (ur)
- Hindi (hi)
- German (de)
- Bosnian (bs)
- Vietnamese (vi)
- Bangla (bn)
- Kiswahili (sw)
 
### Translation Workflow
 
1. **Extract**: `yarn sync` → extracts strings from source code
2. **Translate**: Via Translation.io web interface
3. **Compile**: `yarn lingui compile` → creates runtime catalogs
 
### Usage Pattern
 
```typescript
import {t} from '@lingui/macro';
 
// In code
const message = t`Next prayer`;
 
// In JSX
<Trans>Settings</Trans>
```
 
### Translation Keys
 
Messages are automatically extracted from:
- `t` macro calls
- `<Trans>` components
- `msg` descriptor objects
 
### Bootstrap
 
Locale loaded during app bootstrap (`src/bootstrap.ts`):
```typescript
loadLocale(state['SELECTED_LOCALE']);
i18n.activate(locale);
```
 
---
 
## Coding Standards
 
### TypeScript Configuration
 
**Strict Mode Enabled** (`tsconfig.json`):
- `strict: true`
- `noImplicitReturns: true`
- `forceConsistentCasingInFileNames: true`
- `isolatedModules: true`
 
**Path Aliases**:
```json
{
  "@/*": ["src/*"]
}
```
 
### ESLint Rules
 
**Key Rules** (`.eslintrc.js`):
- Prettier integration (`prettier/prettier: error`)
- Import ordering (alphabetical, grouped)
- No unused variables (TypeScript)
- Object curly spacing: never (`{key: value}`)
- No multiple empty lines (max: 2)
- React hooks rules enforced
- No namespace imports
 
### Prettier Configuration
 
**Settings** (`.prettierrc.js`):
```javascript
{
  bracketSpacing: false,        // {foo: bar} not { foo: bar }
  bracketSameLine: true,         // > on same line
  singleQuote: true,             // 'string' not "string"
  trailingComma: 'all',          // trailing commas everywhere
  arrowParens: 'avoid',          // x => x not (x) => x
  semi: true,                    // semicolons required
}
```
 
### Naming Conventions
 
**Files**:
- Components: `PascalCase.tsx`
- Utilities: `snake_case.ts` or `camelCase.ts`
- Screens: `snake_case/index.tsx`
 
**Variables**:
- React components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Store properties: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`
 
**Store Actions**:
- Setters: `setSetting`, `setProperty`
- Removers: `removeSetting`, `deleteEntry`
- Savers: `saveEntry`, `saveTimestamp`
 
### Code Organization
 
**Import Order** (enforced by ESLint):
1. Built-in modules (react, react-native)
2. External dependencies
3. Parent directory imports
4. Sibling imports
5. Index imports
6. Aliases (`@/...`)
 
**Example**:
```typescript
import {useEffect} from 'react';
import {View} from 'react-native';
import {Button} from 'native-base';
import {useStore} from 'zustand';
import {settings} from '@/store/settings';
```
 
### Component Patterns
 
**Functional Components with Hooks**:
```typescript
export function ComponentName(): React.JSX.Element {
  // Hooks
  const [state, setState] = useState();
  const navigation = useNavigation();
 
  // Effects
  useEffect(() => {
    // side effects
  }, [dependencies]);
 
  // Handlers
  const handlePress = useCallback(() => {
    // handler logic
  }, [dependencies]);
 
  // Render
  return (
    <View>
      {/* JSX */}
    </View>
  );
}
```
 
**Store Hooks**:
```typescript
// Use specific store hook
const [value, setValue] = useSettings('PROPERTY_NAME');
 
// Or use Zustand directly
const value = useStore(settings, s => s.PROPERTY_NAME);
const action = useStore(settings, s => s.action);
```
 
---
 
## Build Process
 
### Development Build
 
```bash
# 1. Install dependencies
yarn install
 
# 2. Compile translations
yarn lingui compile
 
# 3. Start Metro bundler
yarn start
 
# 4. Build and run debug APK
yarn android
```
 
### Release Build (Local)
 
```bash
# Build release APK (unsigned)
cd android
./gradlew :app:assembleRelease -PnoSign -PuseLegacyPackaging=true
 
# Or build App Bundle
./gradlew :app:bundleRelease -PnoSign
```
 
**Output**:
- APKs: `android/app/build/outputs/apk/release/`
- AAB: `android/app/build/outputs/bundle/release/`
 
### Build Variants
 
**Debug**:
- Package: `com.github.meypod.al_azan.preview`
- Signed with debug keystore
- Console logs enabled
 
**Release**:
- Package: `com.github.meypod.al_azan`
- Proguard minification enabled
- Console logs removed (babel plugin)
- Requires signing for distribution
 
### APK Splitting
 
**Enabled** (`android/app/build.gradle`):
```gradle
enableSeparateBuildPerCPUArchitecture = true
```
 
**Architectures**:
- armeabi-v7a (32-bit ARM)
- arm64-v8a (64-bit ARM)
- x86 (32-bit x86)
- x86_64 (64-bit x86)
 
Each architecture gets separate APK + one universal APK.
 
### Version Management
 
**Version Bump**:
```bash
yarn np --no-publish
```
 
This:
1. Prompts for version number
2. Updates `package.json`
3. Creates git commit and tag
4. Runs `postversion` hook → updates Android versionName/versionCode
 
### Build Configuration
 
**Gradle** (`android/app/build.gradle`):
- `compileSdk`: 34
- `minSdk`: 23 (Android 6.0)
- `targetSdk`: 34 (Android 14)
- ProGuard enabled for release
- JSC Intl variant (for i18n support)
- Hermes enabled
 
**Metro** (`metro.config.js`):
- Custom transformer configuration
- Asset extensions configured
- Source maps enabled
 
**Babel** (`babel.config.js`):
- Lingui macros plugin
- Module resolver for `@/` alias
- React Native preset
- Reanimated plugin
- Console removal in production
 
---
 
## Testing
 
### Test Framework: Jest
 
**Configuration**: `jest.config.js`
 
```javascript
{
  preset: 'react-native',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock non-JS assets
  },
  fakeTimers: {legacyFakeTimers: true},
  forceExit: true,
}
```
 
### Running Tests
 
```bash
# Run all tests
yarn test
 
# Run tests in watch mode
yarn test --watch
 
# Run with coverage
yarn test --coverage
```
 
### Test Files
 
Located alongside source files or in `__tests__/` directories.
 
**Naming**: `*.test.ts`, `*.test.tsx`, `*.spec.ts`
 
### Mocks
 
**Location**: `__mocks__/`
 
- Non-JS assets (images, audio) mocked to prevent import errors
- Native modules mocked via Jest's auto-mocking
 
### CI Testing
 
Tests run on every PR via GitHub Actions (`.github/workflows/tests.yml`):
- Node.js 16
- Yarn install with frozen lockfile
- `yarn test`
 
---
 
## Deployment
 
### Platforms
 
1. **Google Play Store** (Internal Track → Production)
2. **GitHub Releases** (Pre-release)
3. **F-Droid** (via metadata)
 
### Automated Deployment (GitHub Actions)
 
**Workflow**: `.github/workflows/build_and_deploy.yml`
 
**Triggers**:
- Release published on GitHub
- Pull request (build only, no deploy)
- Manual workflow dispatch
 
**Process**:
 
1. **Setup**:
   - Ubuntu container with Android NDK
   - Java 17 (Temurin)
   - Node 20
   - Gradle
 
2. **Build**:
   - Install dependencies (`yarn install --frozen-lockfile`)
   - Patch Notifee (remove Firebase dependencies)
   - Compile Lingui locales
   - Build release APKs (per-architecture + universal)
   - Build App Bundle (AAB)
 
3. **Sign** (only on release):
   - Sign APKs with Android signing key (from secrets)
   - Sign AAB
 
4. **Deploy**:
   - **GitHub**: Upload signed APKs and AAB to release
   - **Play Store**: Upload AAB to internal track (draft status)
 
### Secrets Required
 
GitHub repository secrets:
- `ANDROID_SIGNING_KEY`: Base64-encoded keystore
- `ANDROID_ALIAS`: Key alias
- `ANDROID_KEY_STORE_PASSWORD`: Keystore password
- `ANDROID_KEY_PASSWORD`: Key password
- `SERVICE_ACCOUNT_JSON`: Google Play service account
 
### Version Management
 
**Versioning**:
- Semantic versioning (MAJOR.MINOR.PATCH)
- Prefix `-rc` for release candidates (won't deploy to Play Store)
 
**Version Codes**:
- Base: Manual in `build.gradle` (currently 77)
- Per-arch: `baseVersion * 1000 + archCode`
  - armeabi-v7a: +1
  - x86: +2
  - arm64-v8a: +3
  - x86_64: +4
 
**Release Process**:
1. Run `yarn np --no-publish`
2. Choose version number
3. Push tags: `git push --follow-tags`
4. Create GitHub release with tag
5. CI builds and deploys automatically
 
### Play Store Release
 
After CI uploads to internal track:
1. Go to Google Play Console
2. Promote internal → alpha → beta → production
3. Approve and publish
 
### F-Droid Release
 
F-Droid builds from source automatically:
- Metadata: `fastlane/metadata/`
- Build recipe in F-Droid repo
- Updates every few days after git tag
 
---
 
## Development Workflow
 
### Prerequisites
 
**System Requirements**:
- Node.js >= 18
- Yarn 4.4.0 (via Corepack)
- Android SDK (API 34)
- Android NDK
- Java 17
 
**Optional**:
- Android Studio (for emulator)
- VS Code with recommended extensions
 
### Initial Setup
 
```bash
# 1. Clone with submodules
git clone --recurse-submodules git@github.com:meypod/al-azan.git
cd al-azan
 
# 2. Install dependencies
yarn install
 
# 3. Setup lingui config
cp lingui.config.js.example lingui.config.js
# Edit lingui.config.js if needed
 
# 4. Compile translations
yarn lingui compile
```
 
### Development Commands
 
```bash
# Start Metro bundler
yarn start
 
# Run on Android (debug)
yarn android
 
# Run on iOS (not supported yet)
yarn ios
 
# View Android logs
yarn log
 
# Lint code
yarn lint
 
# Fix lint issues
yarn lint-fix
 
# Run tests
yarn test
 
# Extract translation strings
yarn lingui extract
 
# Compile translations
yarn lingui compile
 
# Update translations and metadata
yarn sync_and_purge
```
 
### Debugging
 
**React Native Debugger**:
- Press `d` in Metro console
- Or shake device → "Debug" menu
 
**Android Logs**:
```bash
yarn log
# or
adb logcat *:S ReactNative:V ReactNativeJS:V
```
 
**Chrome DevTools**:
- Works with Hermes debugger
- Network inspection
- Console logs
 
### Making Changes
 
**Workflow**:
1. Create feature branch
2. Make changes
3. Run linter: `yarn lint-fix`
4. Test changes
5. Commit with clear message
6. Push and create PR
7. CI runs tests automatically
8. Merge after approval
 
**Code Review Checklist**:
- No TypeScript errors
- Passes ESLint/Prettier
- Tests pass
- New features have tests
- Translations extracted if needed
- No performance regressions
- Android permissions justified
 
### Troubleshooting
 
**Clean Build**:
```bash
# Clean Android build
cd android && ./gradlew clean
 
# Clear Metro cache
yarn start --reset-cache
 
# Clear node_modules
rm -rf node_modules
yarn install
```
 
**Gradle Issues**:
```bash
# Update Gradle wrapper
cd android && ./gradlew wrapper --gradle-version=8.x
 
# Check for dependency issues
./gradlew app:dependencies
```
 
**Native Module Linking**:
- Rebuild after adding native dependencies
- Check `node_modules/@react-native-community/cli-platform-android/native_modules.gradle`
 
### Performance Optimization
 
**Tips**:
- Use `React.memo()` for expensive components
- Optimize FlatList with `getItemLayout`
- Use Reanimated for animations
- Minimize re-renders with `useCallback`/`useMemo`
- Profile with React DevTools Profiler
- Monitor app size and bundle size
 
### Patching Dependencies
 
Uses `patch-package`:
1. Modify code in `node_modules/`
2. Run `yarn patch-package <package-name>`
3. Patch saved to `patches/`
4. Applied automatically on `yarn install`
 
---
 
## Additional Resources
 
### External Libraries
 
- **Adhan Calculation**: https://github.com/batoulapps/adhan-js
- **Notifee**: https://notifee.app/
- **Zustand**: https://github.com/pmndrs/zustand
- **React Navigation**: https://reactnavigation.org/
- **Lingui**: https://lingui.dev/
 
### Documentation
 
- **React Native**: https://reactnative.dev/
- **Android Developers**: https://developer.android.com/
- **Native Base**: https://nativebase.io/
 
### Community
 
- **GitHub Issues**: https://github.com/meypod/al-azan/issues
- **GitHub Discussions**: For Q&A and ideas
- **Translation.io**: For translation contributions
 
---
 
**Last Updated**: 2026-01-23
**Project Version**: 1.17.10
**Documentation Version**: 1.0
