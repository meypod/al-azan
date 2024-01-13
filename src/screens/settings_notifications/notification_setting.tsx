import {t} from '@lingui/macro';
import keys from 'lodash/keys';
import {
  HStack,
  Text,
  Button,
  VStack,
  Checkbox,
  Stack,
  Spacer,
  IStackProps,
} from 'native-base';
import {memo, useCallback, useMemo} from 'react';
import {Prayer, translatePrayer} from '@/adhan';
import {ExpandCircleDownIcon} from '@/assets/icons/material_icons/expand_circle_down';
import Divider from '@/components/Divider';
import {WeekDaySelector} from '@/components/week_day_selector';
import {
  getAdhanSettingKey,
  PrayerAlarmSettings,
  useAlarmSettings,
} from '@/store/alarm';
import {WeekDayIndex} from '@/utils/date';

type NotificationSettingProps = {
  prayer: Prayer;
  onExpandChanged?: (isExpanded: boolean, prayer: Prayer) => void;
  expanded?: boolean;
};

type getChangedValuesOptions = {
  sound: PrayerAlarmSettings;
  notify: PrayerAlarmSettings;
  newSound?: PrayerAlarmSettings;
  newNotify?: PrayerAlarmSettings;
};

/** returns [newSound, newNotify] */
function getChangedValues(options: getChangedValuesOptions) {
  const {
    notify,
    sound,
    newNotify,
    newSound,
    newNotify: mn = notify,
    newSound: ms = sound,
  } = options;

  let {mn: modifiedNotify = false, ms: modifiedSound = false} = {mn, ms};

  if (typeof newSound !== 'undefined') {
    if (typeof modifiedSound === 'boolean') {
      if (modifiedSound) {
        modifiedNotify = true;
      }
    } else {
      if (typeof modifiedNotify === 'boolean') {
        if (modifiedNotify === true) {
          modifiedNotify = {
            0: true,
            1: true,
            2: true,
            3: true,
            4: true,
            5: true,
            6: true,
            ...modifiedSound,
          };
        } else {
          modifiedNotify = modifiedSound;
        }
      } else {
        modifiedNotify = {
          ...modifiedNotify,
          ...modifiedSound,
        };
      }
    }
  }

  if (typeof newNotify !== 'undefined') {
    if (typeof modifiedNotify === 'boolean') {
      if (!modifiedNotify) {
        modifiedSound = false;
      }
    } else {
      if (typeof modifiedSound !== 'object') {
        if (modifiedSound) {
          modifiedSound = {
            0: true,
            1: true,
            2: true,
            3: true,
            4: true,
            5: true,
            6: true,
          };
        } else {
          modifiedSound = {};
        }
      } else {
        modifiedSound = {...modifiedSound}; // without cloning we cant modify it.
      }

      for (const k of keys(modifiedSound)) {
        if (!(k in modifiedNotify)) {
          delete modifiedSound[k as unknown as WeekDayIndex];
        }
      }
    }
  }

  // full active correction (sound)
  if (typeof modifiedSound === 'object') {
    const modifiedSoundKeysLength = keys(modifiedSound).length;
    if (modifiedSoundKeysLength >= 7) {
      modifiedSound = true;
    } else if (modifiedSoundKeysLength === 0) {
      modifiedSound = false;
    }
  }
  // full active correction (notify)
  if (typeof modifiedNotify === 'object') {
    const modifiedNotifyKeysLength = keys(modifiedNotify).length;
    if (modifiedNotifyKeysLength >= 7) {
      modifiedNotify = true;
    } else if (modifiedNotifyKeysLength === 0) {
      modifiedNotify = false;
    }
  }

  return {modifiedSound, modifiedNotify};
}

const NotificationToggleButton = memo(function NotificationToggleButton({
  prayerName,
  toggleNotify,
  notify,
  notifyFullActive,
}: {
  prayerName: string;
  toggleNotify: (...args: any) => void;
  notifyFullActive?: boolean;
  notify?: PrayerAlarmSettings;
}) {
  return (
    <Button
      size="sm"
      py="1"
      px="2"
      variant="unstyled"
      onPress={toggleNotify}
      borderWidth={1}
      _light={{
        backgroundColor: notifyFullActive ? 'primary.500' : 'black:alpha.5',
        borderColor: notifyFullActive
          ? 'primary.500'
          : notify
          ? 'primary.500'
          : 'black:alpha.5',
      }}
      _dark={{
        backgroundColor: notifyFullActive ? 'primary.800' : 'black',
        borderColor: notifyFullActive
          ? 'primary.800'
          : notify
          ? 'primary.900'
          : 'black',
      }}>
      <HStack justifyContent="center" alignItems="center">
        <Text
          fontSize="xs"
          _light={{
            color: notifyFullActive ? 'white' : 'black:alpha.70',
          }}
          _dark={{
            color: 'white:alpha.90',
          }}>{t`Notification`}</Text>
        <Stack mx="0.5" />
        <Checkbox
          p="0"
          size="sm"
          isDisabled={true}
          value="notify"
          isChecked={!!notify}
          accessibilityLabel={t`${prayerName} notification will be shown`}
          _disabled={{
            opacity: 1,
          }}
        />
      </HStack>
    </Button>
  );
});
const SoundToggleButton = memo(function SoundToggleButton({
  prayerName,
  toggleSound,
  sound,
  soundFullActive,
}: {
  prayerName: string;
  toggleSound: (...args: any) => void;
  soundFullActive?: boolean;
  sound?: PrayerAlarmSettings;
}) {
  return (
    <Button
      size="sm"
      py="1"
      px="2"
      justifyContent="center"
      alignItems="center"
      variant="unstyled"
      onPress={toggleSound}
      borderWidth={1}
      _light={{
        backgroundColor: soundFullActive
          ? 'emerald.500:alpha.70'
          : 'black:alpha.5',
        borderColor: soundFullActive
          ? 'emerald.500:alpha.70'
          : sound
          ? 'emerald.500:alpha.70'
          : 'black:alpha.5',
      }}
      _dark={{
        backgroundColor: soundFullActive ? 'emerald.700' : 'black',
        borderColor: soundFullActive
          ? 'emerald.700'
          : sound
          ? 'emerald.800'
          : 'black',
      }}>
      <HStack justifyContent="center" alignItems="center">
        <Text
          fontSize="xs"
          _light={{
            color: soundFullActive ? 'white' : 'black:alpha.70',
          }}
          _dark={{
            color: 'white:alpha.90',
          }}>{t`Sound`}</Text>
        <Stack mx="0.5" />
        <Checkbox
          p="0"
          size="sm"
          value="sound"
          colorScheme="emerald"
          isDisabled={true}
          isChecked={!!sound}
          accessibilityLabel={t`${prayerName} sound will be played`}
          _disabled={{
            opacity: 1,
          }}
        />
      </HStack>
    </Button>
  );
});

const CollapsibleSelector = memo(function CollapsibleSelector({
  show,
  notify,
  setNotifyProxy,
  sound,
  setSoundProxy,
}: {
  show?: boolean;
  setNotifyProxy: (...args: any) => void;
  setSoundProxy: (...args: any) => void;
  sound?: PrayerAlarmSettings;
  notify?: PrayerAlarmSettings;
}) {
  if (show) {
    return (
      <VStack px="2" py="1">
        <VStack>
          <Divider fontSize="xs" label={t`Notification`} mb="1" />
          <WeekDaySelector value={notify} onChanged={setNotifyProxy} />
        </VStack>
        <VStack>
          <Divider fontSize="xs" label={t`Sound`} mb="1" />
          <WeekDaySelector
            value={sound}
            onChanged={setSoundProxy}
            colorScheme="emerald"
          />
        </VStack>
      </VStack>
    );
  }
  return <></>;
});

export const NotificationSetting = function NotificationSetting({
  prayer,
  onExpandChanged,
  expanded,
  ...stackProps
}: NotificationSettingProps & IStackProps) {
  const [notify, setNotify] = useAlarmSettings(
    getAdhanSettingKey(prayer, 'notify') as 'FAJR_NOTIFY', // any notify/sound key to get the types
  );
  const [sound, setSound] = useAlarmSettings(
    getAdhanSettingKey(prayer, 'sound') as 'FAJR_SOUND',
  );

  const toggleExpanded = useCallback(() => {
    onExpandChanged && onExpandChanged(!expanded, prayer);
  }, [expanded, onExpandChanged, prayer]);

  const setSoundProxy = useCallback(
    (s: PrayerAlarmSettings) => {
      const {modifiedSound, modifiedNotify} = getChangedValues({
        notify,
        sound,
        newSound: s,
      });
      setSound(modifiedSound);
      setNotify(modifiedNotify);
    },
    [notify, setNotify, setSound, sound],
  );

  const setNotifyProxy = useCallback(
    (s: PrayerAlarmSettings) => {
      const {modifiedSound, modifiedNotify} = getChangedValues({
        notify,
        sound,
        newNotify: s,
      });
      setSound(modifiedSound);
      setNotify(modifiedNotify);
    },
    [notify, setNotify, setSound, sound],
  );

  const toggleSound = useCallback(() => {
    setSoundProxy(!sound);
  }, [sound, setSoundProxy]);

  const toggleNotify = useCallback(() => {
    setNotifyProxy(!notify);
  }, [notify, setNotifyProxy]);

  const prayerName = useMemo(() => translatePrayer(prayer), [prayer]);

  const notifyFullActive = useMemo(
    () => notify && typeof notify === 'boolean',
    [notify],
  );
  const soundFullActive = useMemo(
    () => sound && typeof sound === 'boolean',
    [sound],
  );

  return (
    <Stack
      backgroundColor={'coolGray.400:alpha.20'}
      borderRadius={4}
      mb="1"
      {...stackProps}>
      <HStack
        alignItems="center"
        py="1"
        pl="2"
        pr="1"
        flexWrap="wrap"
        justifyContent="space-between"
        mb={expanded ? -2 : 0}>
        <Text noOfLines={1} flexShrink={0} flexGrow={1}>
          {prayerName}
        </Text>
        <Spacer flexGrow={0} px="0.5" />
        <HStack flexShrink={0} flexGrow={1} justifyContent="flex-end">
          <NotificationToggleButton
            prayerName={prayerName}
            toggleNotify={toggleNotify}
            notify={notify}
            notifyFullActive={notifyFullActive}
          />

          <Spacer flexGrow={0} px="1" />

          <SoundToggleButton
            prayerName={prayerName}
            toggleSound={toggleSound}
            sound={sound}
            soundFullActive={soundFullActive}
          />

          <Spacer flexGrow={0} px="0.5" />

          <Button
            onPress={toggleExpanded}
            variant="unstyled"
            size="sm"
            p="0"
            flex={0}
            flexGrow={0}
            flexShrink={1}>
            <ExpandCircleDownIcon
              size="2xl"
              style={{
                transform: [{rotate: expanded ? '180deg' : '0deg'}],
              }}
            />
          </Button>
        </HStack>
      </HStack>
      <CollapsibleSelector
        setNotifyProxy={setNotifyProxy}
        setSoundProxy={setSoundProxy}
        show={expanded}
        notify={notify}
        sound={sound}
      />
    </Stack>
  );
};
