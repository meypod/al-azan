import {t} from '@lingui/macro';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  Stack,
  HStack,
  FormControl,
  CloseIcon,
  Button,
  Text,
  Spacer,
  WarningOutlineIcon,
} from 'native-base';
import {memo, useCallback} from 'react';
import {ToastAndroid} from 'react-native';
import {NumericInput} from '@/components/numeric_input';
import {LocationDetail} from '@/store/calculation';

const clipboardCoordsRegex = /\s*([-\d.]+)[\s°NS]*[,| ]{1}\s*([-\d.]+)[\s°EW]*/;

function isValidCoords(num: number) {
  return num >= -180 && num <= 180;
}

export type LocationCoordinatesProps = {
  selectedLocation: LocationDetail | undefined;
  onLocationSelected: (val: LocationDetail | undefined) => void;
};

export const LocationCoordinates = memo(function LocationCoordinates({
  onLocationSelected,
  selectedLocation,
}: LocationCoordinatesProps) {
  const clearLocation = useCallback(
    () => onLocationSelected(undefined),
    [onLocationSelected],
  );

  const onLatChange = useCallback(
    (num: number | undefined) => {
      onLocationSelected({long: selectedLocation?.long, lat: num});
    },
    [selectedLocation, onLocationSelected],
  );

  const onLongChange = useCallback(
    (num: number | undefined) => {
      onLocationSelected({long: num, lat: selectedLocation?.lat});
    },
    [selectedLocation, onLocationSelected],
  );

  const onPasteButtonPressed = useCallback(() => {
    Clipboard.getString()
      .then(str => {
        const match = str.match(clipboardCoordsRegex);
        if (match && match.length === 3) {
          const parsedLat = parseFloat(match[1]);
          const parsedLong = parseFloat(match[2]);
          if (
            !isNaN(parsedLat) &&
            !isNaN(parsedLong) &&
            isValidCoords(parsedLat) &&
            isValidCoords(parsedLong)
          ) {
            onLocationSelected({long: parsedLong, lat: parsedLat});
          }
        } else {
          ToastAndroid.show(
            t`Clipboard data does not contain coordinates`,
            ToastAndroid.SHORT,
          );
        }
      })
      .catch(() => {
        ToastAndroid.show(t`Error getting clipboard data`, ToastAndroid.SHORT);
      });
  }, [onLocationSelected]);

  return (
    <Stack>
      <HStack>
        <FormControl flex={1} flexGrow={1} pr="1">
          <FormControl.Label justifyContent="center">{t`Latitude`}</FormControl.Label>
          <NumericInput
            py="0"
            flex={1}
            fontSize="lg"
            textAlign="center"
            placeholder={t`Latitude`}
            value={selectedLocation?.lat}
            onChange={onLatChange}
            invalidLabel="-"
            invalidValue={undefined}
          />
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {t`Latitude is invalid`}
          </FormControl.ErrorMessage>
        </FormControl>
        <FormControl flex={1} flexGrow={1} pl="1">
          <FormControl.Label justifyContent="center">{t`Longitude`}</FormControl.Label>
          <NumericInput
            py="0"
            flex={1}
            fontSize="lg"
            textAlign="center"
            placeholder={t`Longitude`}
            value={selectedLocation?.long}
            onChange={onLongChange}
            invalidLabel="-"
            invalidValue={undefined}
          />
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {t`Longitude is invalid`}
          </FormControl.ErrorMessage>
        </FormControl>

        {selectedLocation ? (
          <FormControl flexShrink={1} flexGrow={0} w="10" pl="1">
            <FormControl.Label> </FormControl.Label>
            <Button
              flex={1}
              accessibilityLabel={t`Clear the coordinates`}
              borderColor="danger.900"
              variant="outline"
              colorScheme="danger"
              size="sm"
              onPress={clearLocation}>
              <CloseIcon />
            </Button>
          </FormControl>
        ) : undefined}
      </HStack>
      <HStack mt="5">
        <FormControl alignItems="center" justifyContent="center">
          <FormControl.Label mb="3">
            <Text fontSize="sm" textAlign="justify">
              {t`You can also paste coords from clipboard`}
            </Text>
          </FormControl.Label>
          <Button
            onPress={onPasteButtonPressed}
            textAlign="center"
            width="1/3">{t`Paste`}</Button>
          <Spacer />
        </FormControl>
      </HStack>
    </Stack>
  );
});
