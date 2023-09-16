import {t} from '@lingui/macro';
import {
  Stack,
  Button,
  HStack,
  VStack,
  Text,
  FormControl,
  Input,
} from 'native-base';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {Modal} from 'react-native';
import {translateCommonIds} from './counter_view';
import {PrayersInOrder, translatePrayer} from '@/adhan';
import {CloseIcon} from '@/assets/icons/material_icons/close';
import {DeleteIcon} from '@/assets/icons/material_icons/delete';
import {NumericInput} from '@/components/numeric_input';
import {Counter} from '@/store/counter';
import {showDeleteDialog} from '@/utils/dialogs';

export type EditCounterModalProps = {
  counterState: Partial<Counter> | null;
  onCancel: (...args: any) => void;
  onConfirm: (editedCounterState: Counter) => void;
  onDelete: (id: string) => void;
};

const defaultIds = [...PrayersInOrder, 'fast'];

export function EditCounterModal({
  counterState,
  onCancel,
  onConfirm,
  onDelete,
}: EditCounterModalProps) {
  const [draftCounterState, setDraftCounterState] =
    useState<Partial<Counter> | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (counterState) {
      const eMode = !!Object.keys(counterState).length;
      setEditMode(eMode);
      setDraftCounterState({
        count: 0,
        ...counterState,
        id: eMode ? counterState.id : 'counter_' + Date.now().toString(),
      });
    } else {
      setDraftCounterState(null);
    }
  }, [counterState]);

  const isDefaultCounter: boolean = useMemo(() => {
    return defaultIds.includes(counterState?.id || '');
  }, [counterState]);

  const onConfirmProxy = useCallback(() => {
    onConfirm(draftCounterState as Counter);
    setDraftCounterState(null);
  }, [draftCounterState, onConfirm]);

  const onDeleteCounter = useCallback(() => {
    showDeleteDialog(counterState?.label).then(agreed => {
      if (agreed && counterState?.id) {
        onDelete(counterState.id);
        setDraftCounterState(null);
      }
    });
  }, [counterState, onDelete]);

  const onCountChanged = useCallback(
    (num: number) => {
      setDraftCounterState({
        ...draftCounterState,
        lastCount: counterState?.count !== undefined ? counterState.count : num,
        count: num,
        lastModified: Date.now(),
      });
    },
    [draftCounterState, counterState],
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={!!draftCounterState}
      onRequestClose={onCancel}>
      <Stack p="2" bg="black:alpha.40" flex={1} justifyContent="center">
        <Stack
          m="5"
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
              <Text>{editMode ? t`Edit Counter` : t`New Counter`}</Text>
            </Stack>
            <HStack>
              {!isDefaultCounter && editMode && (
                <Button onPress={onDeleteCounter} variant="ghost">
                  <DeleteIcon size="xl" color="red.400" />
                </Button>
              )}
              <Button
                onPress={onCancel}
                variant="ghost"
                accessibilityLabel={t`Cancel`}>
                <CloseIcon size="xl" />
              </Button>
            </HStack>
          </HStack>
          <VStack p="3">
            <FormControl>
              <FormControl.Label>{t`Label`}:</FormControl.Label>
              <Input
                isDisabled={isDefaultCounter}
                isReadOnly={isDefaultCounter}
                value={
                  draftCounterState?.label ||
                  (counterState?.id &&
                    (translatePrayer(counterState.id) ||
                      translateCommonIds(counterState.id)))
                }
                onChangeText={text =>
                  setDraftCounterState({...draftCounterState, label: text})
                }
              />
            </FormControl>

            {editMode && (
              <FormControl>
                <FormControl.Label>{t`Count`}:</FormControl.Label>
                <NumericInput
                  int
                  value={draftCounterState?.count}
                  onChange={onCountChanged}
                />
              </FormControl>
            )}
          </VStack>
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
            <Button onPress={onConfirmProxy}>{t`Confirm`}</Button>
            <Button onPress={onCancel}>{t`Cancel`}</Button>
          </HStack>
        </Stack>
      </Stack>
    </Modal>
  );
}
