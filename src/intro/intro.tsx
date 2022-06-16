import {t} from '@lingui/macro';
import {Modal, Box, StatusBar, Button} from 'native-base';
import {useState} from 'react';
import AppIntroSlider from 'react-native-app-intro-slider';
import {isMinimumSettingsAvailable} from '@/adhan';
import {IntroItem} from '@/intro/intro_item';
import {BatteryOptimizationSlide} from '@/intro/slides/battery';
import {CalculationSlide} from '@/intro/slides/calculation';
import {LocationSlide} from '@/intro/slides/location';
import {NotificationAndSoundSlide} from '@/intro/slides/notification';
import {WelcomeSlide} from '@/intro/slides/welcome';
import {useSettingsHelper} from '@/store/settings';

const data = [
  {
    title: t`Welcome`,
    children: <WelcomeSlide />,
  },
  {
    title: t`Location`,
    children: <LocationSlide />,
  },
  {
    title: t`Calculation`,
    children: <CalculationSlide />,
  },
  {
    title: t`Notification & Sound`,
    children: <NotificationAndSoundSlide />,
  },
  {
    title: t`Battery Optimization`,
    children: <BatteryOptimizationSlide />,
  },
];

type Item = typeof data[0];

function _keyExtractor(item: Item) {
  return item.title;
}

export default Intro;

export function Intro() {
  const [, setAppIntroDone] = useSettingsHelper('APP_INTRO_DONE');

  const [configAlertIsOpen, setConfigAlertIsOpen] = useState(false);

  const onDonePressed = async () => {
    if (isMinimumSettingsAvailable()) {
      setAppIntroDone(true);
    } else {
      setConfigAlertIsOpen(true);
    }
  };

  const onConfigAlertClose = () => {
    setConfigAlertIsOpen(false);
  };

  const onConfigAlertOk = () => {
    setConfigAlertIsOpen(false);
    setAppIntroDone(true);
  };

  return (
    <Box flex="1" safeArea>
      <StatusBar />
      <AppIntroSlider<Item>
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        keyExtractor={_keyExtractor}
        nextLabel={t`Next`}
        doneLabel={t`Done`}
        skipLabel={t`Skip`}
        showSkipButton={true}
        onSkip={() => setConfigAlertIsOpen(true)}
        onDone={() => onDonePressed()}
        renderItem={IntroItem}
        data={data}
      />
      <Modal isOpen={configAlertIsOpen} onClose={onConfigAlertClose}>
        <Modal.Content>
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
    </Box>
  );
}
