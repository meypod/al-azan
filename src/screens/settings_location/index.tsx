import {t} from '@lingui/macro';

import {ScrollView, IScrollViewProps, Text} from 'native-base';

import {LocationStack} from './location_stack';
import {SafeArea} from '@/components/safe_area';
import {useCalcSettings} from '@/store/calculation';

export function LocationSettings(props: IScrollViewProps) {
  const [location, setLocation] = useCalcSettings('LOCATION');

  return (
    <SafeArea>
      <ScrollView
        p="4"
        _contentContainerStyle={{paddingBottom: 40}}
        {...props}
        keyboardShouldPersistTaps="handled">
        <Text textAlign="justify">{t`To calculate Adhan, We need your location. You can use the "Find My Location" button, or use the country and city/area search, or enter your coordinates manually.`}</Text>

        <LocationStack
          onLocationSelected={setLocation}
          selectedLocation={location}
        />
      </ScrollView>
    </SafeArea>
  );
}
