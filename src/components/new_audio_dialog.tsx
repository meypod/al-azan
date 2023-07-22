import {t} from '@lingui/macro';
import {
  FormControl,
  Input,
  Modal,
  WarningOutlineIcon,
  Text,
  Button,
} from 'native-base';
import {memo, useCallback, useEffect, useState} from 'react';

export const NewAudioDialog = memo(function NewAudioDialog({
  selectedFilePath,
  initialAudioName = '',
  onSave,
  onCancel,
}: {
  selectedFilePath: string | undefined;
  initialAudioName?: string;
  onSave: (newName: string) => void;
  onCancel: (...args: any) => void;
}) {
  const [newAudioName, setNewAudioName] = useState<string | null>(
    initialAudioName,
  );

  useEffect(() => {
    setNewAudioName(initialAudioName);
  }, [setNewAudioName, initialAudioName]);

  const onAddPressed = useCallback(() => {
    if (!newAudioName) return;
    onSave(newAudioName);
  }, [onSave, newAudioName]);

  return (
    <Modal size="full" isOpen={!!selectedFilePath} onClose={onCancel}>
      <Modal.Content borderRadius={0}>
        <Modal.CloseButton />
        <Modal.Header>{t`Add Custom Audio`}</Modal.Header>
        <Modal.Body>
          <FormControl isInvalid={!newAudioName}>
            <FormControl.Label>{t`Name`}</FormControl.Label>
            <Input
              value={newAudioName || ''}
              placeholder={t`Name`}
              onChangeText={setNewAudioName}
            />
            <FormControl.ErrorMessage
              leftIcon={<WarningOutlineIcon color="yellow.300" />}>
              <Text color="yellow.400">{t`Selecting a name is required`}</Text>
            </FormControl.ErrorMessage>
          </FormControl>
        </Modal.Body>
        <Modal.Footer>
          <Button mx="2" colorScheme="coolGray" onPress={onCancel}>
            {t`Cancel`}
          </Button>
          <Button colorScheme="coolGray" onPress={onAddPressed}>
            {t`Add`}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
});
