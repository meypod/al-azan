import {t} from '@lingui/macro';
import {
  HStack,
  ScrollView,
  Text,
  IScrollViewProps,
  Checkbox,
  Stack,
} from 'native-base';
import {useEffect} from 'react';
import {HideWidgetPrayerSettings} from '@/screens/settings_widget/hide_widget_prayer_settings';
import {useSettingsHelper} from '@/store/settings';
import {updateWidgets} from '@/tasks/update_widgets';

export function WidgetSettings(props: IScrollViewProps) {
  const [showWidget, setShowWidget] = useSettingsHelper('SHOW_WIDGET');
  const [hiddenPrayers] = useSettingsHelper('HIDDEN_WIDGET_PRAYERS');

  useEffect(() => {
    updateWidgets();
  }, [showWidget, hiddenPrayers]);

  return (
    <ScrollView
      p="4"
      _contentContainerStyle={{paddingBottom: 30}}
      mb="3"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
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
              accessibilityLabel={t`should notification widget be shown?`}
            />
          </Checkbox.Group>
        </Stack>
      </HStack>

      <HideWidgetPrayerSettings />
    </ScrollView>
  );
}
