import {t} from '@lingui/macro';
import {Stack} from 'native-base';
import {GPSButton} from './gps_button';
import {LocationCoordinates} from './location_coordinates';
import {LocationSearch} from './location_search';
import Divider from '@/components/Divider';
import {LocationDetail} from '@/store/calculation';

export type LocationStackProps = {
  selectedLocation: LocationDetail | undefined;
  onLocationSelected: (val: LocationDetail | undefined) => void;
};

export function LocationStack({
  onLocationSelected,
  selectedLocation,
}: LocationStackProps) {
  return (
    <Stack>
      <Divider label={t`Using GPS`} mb="3" mt="2" />

      <GPSButton onLocated={onLocationSelected} />

      <Divider label={t`Using Search`} mt="4" />

      <LocationSearch
        onLocationSelected={onLocationSelected}
        selectedLocation={selectedLocation}
        mt="2"
      />

      <Divider label={t`Using Coordinates`} mb="2" mt="4" />

      <LocationCoordinates
        onLocationSelected={onLocationSelected}
        selectedLocation={selectedLocation}
      />
    </Stack>
  );
}
