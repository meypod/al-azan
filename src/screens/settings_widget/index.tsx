import {t} from '@lingui/macro';
import {
  HStack,
  ScrollView,
  Text,
  IScrollViewProps,
  Checkbox,
  Stack,
} from 'native-base';
import {useEffect, useMemo} from 'react';
import {Platform} from 'react-native';
import {CityNamePosSettings} from './city_name_pos_settings';
import {SafeArea} from '@/components/safe_area';
import {HideWidgetPrayerSettings} from '@/screens/settings_widget/hide_widget_prayer_settings';
import {useSettings} from '@/store/settings';
import {updateWidgets} from '@/tasks/update_widgets';

export function WidgetSettings(props: IScrollViewProps) {
  const [showWidget, setShowWidget] = useSettings('SHOW_WIDGET');
  const [showWidgetCountdown, setShowWidgetCountdown] = useSettings(
    'SHOW_WIDGET_COUNTDOWN',
  );
  const [adaptiveWidget, setAdaptiveWidgets] = useSettings('ADAPTIVE_WIDGETS');
  const [hiddenPrayers] = useSettings('HIDDEN_WIDGET_PRAYERS');

  useEffect(() => {
    updateWidgets();
  }, [showWidget, hiddenPrayers, adaptiveWidget, showWidgetCountdown]);

  const isAdaptiveThemeSupported = useMemo(
    () => Platform.OS === 'android' && Platform.Version >= 31,
    [],
  );

  return (
    <SafeArea>
      <ScrollView
        p="4"
        _contentContainerStyle={{paddingBottom: 20}}
        mb="3"
        {...props}>
        <HStack justifyContent="space-between" mb="4">
          <Text flex="1">{t`Show notification widget?`}</Text>

          <Stack flexShrink="1" justifyContent="center" alignItems="center">
            <Checkbox.Group
              value={showWidget ? ['enabled'] : []}
              onChange={values => {
                if (values && values.length) {
                  setShowWidget(true);
                } else {
                  setShowWidget(false);
                }
              }}>
              <Checkbox
                value="enabled"
                size="md"
                accessibilityLabel={t`should notification widget be shown?`}
              />
            </Checkbox.Group>
          </Stack>
        </HStack>

        <HStack justifyContent="space-between" mb="4">
          <Text flex="1">{t`Show countdown?`}</Text>

          <Stack flexShrink="1" justifyContent="center" alignItems="center">
            <Checkbox.Group
              value={showWidgetCountdown ? ['enabled'] : []}
              onChange={values => {
                if (values && values.length) {
                  setShowWidgetCountdown(true);
                } else {
                  setShowWidgetCountdown(false);
                }
              }}>
              <Checkbox
                value="enabled"
                size="md"
                accessibilityLabel={t`Show countdown?`}
              />
            </Checkbox.Group>
          </Stack>
        </HStack>

        {isAdaptiveThemeSupported && (
          <HStack justifyContent="space-between" mb="4">
            <Text flex="1">{t`Use adaptive theme?`}</Text>

            <Stack flexShrink="1" justifyContent="center" alignItems="center">
              <Checkbox.Group
                value={adaptiveWidget ? ['enabled'] : []}
                onChange={values => {
                  if (values && values.length) {
                    setAdaptiveWidgets(true);
                  } else {
                    setAdaptiveWidgets(false);
                  }
                }}>
                <Checkbox
                  value="enabled"
                  size="md"
                  accessibilityLabel={t`Use adaptive theme?`}
                />
              </Checkbox.Group>
            </Stack>
          </HStack>
        )}

        <CityNamePosSettings mb="4" />

        <HideWidgetPrayerSettings />
      </ScrollView>
    </SafeArea>
  );
}
