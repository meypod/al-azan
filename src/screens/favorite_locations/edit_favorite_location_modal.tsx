import {t} from '@lingui/macro';
import {
  Stack,
  Button,
  HStack,
  Text,
  VStack,
  Input,
  ScrollView,
  Pressable,
} from 'native-base';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {Modal, TouchableWithoutFeedback} from 'react-native';
import {LocationStack} from '../settings_location/location_stack';
import {CloseIcon} from '@/assets/icons/material_icons/close';
import {LocationDetail} from '@/store/calculation';
import type {FavoriteLocation} from '@/store/favorite_locations';

export type EditFavoriteCityProps = {
  state: Partial<FavoriteLocation> | null;
  onCancel: (...args: any) => void;
  onConfirm: (editedFavoriteState: FavoriteLocation) => void;
};

export function EditFavoriteLocationModal({
  state,
  onCancel,
  onConfirm,
}: EditFavoriteCityProps) {
  const [draftState, setDraftState] = useState<
    Partial<FavoriteLocation> | undefined
  >();
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (state) {
      const eMode = !!Object.keys(state).length;
      setEditMode(eMode);
      setDraftState({
        ...state,
        id: eMode ? state.id : 'favorite_city_' + Date.now().toString(),
      });
    } else {
      setDraftState(undefined);
    }
  }, [state]);

  const onConfirmProxy = useCallback(() => {
    onConfirm(draftState as FavoriteLocation);
    setDraftState(undefined);
  }, [draftState, onConfirm]);

  const onLocationSelected = useCallback((val: LocationDetail | undefined) => {
    if (val) {
      setDraftState(s => ({
        ...s,
        ...val,
        label: s?.label || val.city?.selectedName || val.city?.name,
      }));
    } else {
      setDraftState(s => ({id: s?.id, label: s?.label}));
    }
  }, []);

  const cannotSave = useMemo(() => {
    return !(
      draftState &&
      draftState.lat &&
      draftState.long &&
      draftState.label
    );
  }, [draftState]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={!!draftState}
      onRequestClose={onCancel}>
      <Pressable flex={1} bg="black:alpha.50" onPressOut={onCancel}>
        <ScrollView flex={1} paddingTop="10">
          <TouchableWithoutFeedback>
            <Stack
              m="4"
              rounded="lg"
              _dark={{
                bg: 'coolGray.800',
              }}
              _light={{
                bg: 'coolGray.100',
              }}>
              <HStack
                borderBottomWidth={1}
                _dark={{
                  borderBottomColor: 'coolGray.300:alpha.20',
                }}
                _light={{
                  borderBottomColor: 'coolGray.300',
                }}>
                <Stack px="3" flexDirection="row" alignItems="center" flex={1}>
                  <Text>{editMode ? t`Edit Location` : t`New Location`}</Text>
                </Stack>
                <Button
                  onPress={onCancel}
                  variant="ghost"
                  accessibilityLabel={t`Cancel`}>
                  <CloseIcon size="xl" />
                </Button>
              </HStack>
              <Stack p="3">
                <VStack>
                  <Text mb="1" nativeID="location_label_id">
                    {t`Label`}: <Text color="red.500">*</Text>
                  </Text>
                  <Input
                    accessibilityLabelledBy="location_label_id"
                    isRequired={true}
                    value={draftState?.label}
                    onChangeText={text =>
                      setDraftState({...draftState, label: text})
                    }
                  />
                </VStack>
                <LocationStack
                  onLocationSelected={onLocationSelected}
                  selectedLocation={draftState}
                />
              </Stack>
              <HStack
                px="3"
                py="2"
                mt="2"
                _dark={{
                  borderTopColor: 'coolGray.300:alpha.20',
                }}
                _light={{
                  borderTopColor: 'coolGray.300',
                }}
                borderTopWidth={1}
                justifyContent="space-between">
                <Button
                  onPress={onConfirmProxy}
                  disabled={cannotSave}
                  opacity={cannotSave ? 0.5 : 1}>{t`Confirm`}</Button>
                <Button onPress={onCancel}>{t`Cancel`}</Button>
              </HStack>
            </Stack>
          </TouchableWithoutFeedback>
        </ScrollView>
      </Pressable>
    </Modal>
  );
}
