import {t} from '@lingui/macro';
import {Modal, Button, Stack} from 'native-base';
import {useCallback, useState} from 'react';
import AppIntroSlider from 'react-native-app-intro-slider';
import {isMinimumSettingsAvailable} from '@/adhan';
import {SafeArea} from '@/components/safe_area';
import {IntroItem} from '@/screens/intro/intro_item';
import {FixCommonProblemsSlide} from '@/screens/intro/slides/battery';
import {CalculationSlide} from '@/screens/intro/slides/calculation';
import {LocationSlide} from '@/screens/intro/slides/location';
import {NotificationAndSoundSlide} from '@/screens/intro/slides/notification';
import {WelcomeSlide} from '@/screens/intro/slides/welcome';
import {StepLabel} from '@/screens/intro/step_label';
import {alarmSettings} from '@/store/alarm';
import {calcSettings} from '@/store/calculation';
import {reminderSettings} from '@/store/reminder';
import {settings, useSettings} from '@/store/settings';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {updateWidgets} from '@/tasks/update_widgets';
import {sha256} from '@/utils/hash';

const data = [
  {
    title: () => t`Welcome`,
    children: <WelcomeSlide />,
  },
  {
    title: () => t`Location`,
    children: <LocationSlide />,
  },
  {
    title: () => t`Calculation`,
    children: <CalculationSlide />,
  },
  {
    title: () => t`Notification & Sound`,
    children: <NotificationAndSoundSlide />,
  },
  {
    title: () => t`Fix Common Problems`,
    children: <FixCommonProblemsSlide />,
  },
];

type Item = (typeof data)[0];

function _keyExtractor(item: Item) {
  return item.title();
}

export default Intro;

export function Intro() {
  const [, setAppIntroDone] = useSettings('APP_INTRO_DONE');

  const [configAlertIsOpen, setConfigAlertIsOpen] = useState(false);

  const onDonePressed = useCallback(async () => {
    if (isMinimumSettingsAvailable(calcSettings.getState())) {
      // update settings hash
      settings.setState({
        CALC_SETTINGS_HASH: sha256(JSON.stringify(calcSettings.getState())),
        ALARM_SETTINGS_HASH: sha256(JSON.stringify(alarmSettings.getState())),
        REMINDER_SETTINGS_HASH: sha256(
          JSON.stringify(reminderSettings.getState()),
        ),
      });
      // continue to home screen
      setAppIntroDone(true);
      setNextAdhan();
      updateWidgets();
    } else {
      setConfigAlertIsOpen(true);
    }
  }, [setAppIntroDone, setConfigAlertIsOpen]);

  const onConfigAlertClose = useCallback(() => {
    setConfigAlertIsOpen(false);
  }, [setConfigAlertIsOpen]);

  const onConfigAlertOk = useCallback(() => {
    setConfigAlertIsOpen(false);
    setAppIntroDone(true);
    setNextAdhan();
    updateWidgets();
  }, [setConfigAlertIsOpen, setAppIntroDone]);

  return (
    <SafeArea>
      <Stack flex="1">
        <AppIntroSlider<Item>
          keyExtractor={_keyExtractor}
          dotStyle={{borderColor: 'gray', borderWidth: 1}}
          dotClickEnabled={false}
          activeDotStyle={{
            borderColor: '#22d3ee',
            borderWidth: 1,
            backgroundColor: '#22d3ee',
          }}
          renderNextButton={() => <StepLabel label={t`Next`} />}
          renderDoneButton={() => <StepLabel label={t`Done`} />}
          renderSkipButton={() => <StepLabel label={t`Skip`} />}
          showSkipButton={true}
          onSkip={() => setConfigAlertIsOpen(true)}
          onDone={() => onDonePressed()}
          renderItem={IntroItem}
          data={data}
          contentContainerStyle={{
            marginBottom: 60,
          }}
        />
        <Modal
          size="full"
          isOpen={configAlertIsOpen}
          onClose={onConfigAlertClose}>
          <Modal.Content borderRadius={0}>
            <Modal.CloseButton />
            <Modal.Header>{t`Attention`}</Modal.Header>
            <Modal.Body>
              {t`Required settings are incomplete. For app to show prayer times, You have to configure it from settings later.`}
            </Modal.Body>
            <Modal.Footer>
              <Button colorScheme="coolGray" onPress={onConfigAlertOk}>
                {t`Got it`}
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </Stack>
    </SafeArea>
  );
}
