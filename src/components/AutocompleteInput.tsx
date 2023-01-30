import {t} from '@lingui/macro';
import {debounce} from 'lodash';
import {
  FlatList,
  Input,
  View,
  IInputProps,
  Text,
  useDisclose,
  Actionsheet,
  KeyboardAvoidingView,
  SearchIcon,
  HStack,
  Spinner,
  Box,
  WarningOutlineIcon,
} from 'native-base';
import {useCallback, useMemo, useState} from 'react';
import useFuse from '@/utils/hooks/use_fuse';

export const AutocompleteInput = <T extends unknown>(
  props: AutocompleteInputProps<T>,
) => {
  const {
    data = [],
    label,
    autoCompleteKeys,
    getOptionKey = defaultGetOptionKey,
    getOptionLabel = defaultGetOptionLabel(label || 'label'),
    onItemSelected = () => {},
    onChangeText: onChangeTextProp,
    actionsheetLabel,
    loading,
    selectedItem,
    showError,
    errorMessage,
    ...inputProps
  } = props;

  const {isOpen, onOpen, onClose} = useDisclose();
  const [inputVal, setInputVal] = useState<string>('');

  const {results, setSearchTerm} = useFuse(data, {
    keys: autoCompleteKeys,
    threshold: 0.3,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateSearchTerm = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 100),
    [setSearchTerm],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChangeText = useCallback(
    (text: string) => {
      setInputVal(text);
      updateSearchTerm(text);
      onChangeTextProp && onChangeTextProp(text);
    },
    [onChangeTextProp, updateSearchTerm],
  );

  const onListItemPressed = useCallback(
    (item: T) => {
      onItemSelected && onItemSelected(item);
      onClose();
      setInputVal('');
    },
    [onItemSelected, onClose],
  );

  const textValue = useMemo(
    () => selectedItem && getOptionLabel(selectedItem),
    [getOptionLabel, selectedItem],
  );

  return (
    <View flex={1}>
      <Input
        width="100%"
        onTouchEnd={onOpen}
        autoCorrect={false}
        caretHidden={true}
        _input={{
          contextMenuHidden: true,
        }}
        value={textValue}
        variant={selectedItem ? 'underlined' : undefined}
        {...inputProps}
      />
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content minHeight="70%">
          <KeyboardAvoidingView>
            {actionsheetLabel && (
              <Text textAlign="center" mb="2">
                {actionsheetLabel}
              </Text>
            )}
            <HStack width="100%" mb="2">
              <Input
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true}
                flex={1}
                InputLeftElement={<SearchIcon ml="2" />}
                onChangeText={onChangeText}
                value={inputVal}
                placeholder={t`Search`}
              />
              {loading ? <Spinner mx="1"></Spinner> : null}
            </HStack>
            {(!data?.length || !results.length || showError) && (
              <Box
                mt="2"
                pt="16"
                mb="6"
                _light={{
                  backgroundColor: 'gray.200',
                }}
                _dark={{
                  backgroundColor: 'gray.700',
                }}
                flexGrow="1"
                alignItems="center">
                {showError ? (
                  <>
                    <WarningOutlineIcon color="danger.400" size="3xl" mb="2" />
                    <Text color="danger.400" fontSize="xl">
                      {errorMessage ? errorMessage : t`Unknown Error`}
                    </Text>
                  </>
                ) : !data?.length ? (
                  <Text color="gray.500" fontSize="xl">
                    {t`No Data`}
                  </Text>
                ) : (
                  <Text color="gray.400" fontSize="xl">
                    {t`No Results`}
                  </Text>
                )}
              </Box>
            )}

            <FlatList
              flexShrink={1}
              flexGrow={0}
              data={results}
              renderItem={listItemInfo => (
                <Actionsheet.Item
                  onPress={() => onListItemPressed(listItemInfo.item)}>
                  {getOptionLabel(listItemInfo.item)}
                </Actionsheet.Item>
              )}
              keyExtractor={getOptionKey}
            />
          </KeyboardAvoidingView>
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  );
};

const defaultGetOptionKey = (option: any) => {
  if (typeof option === 'object' && option.id) {
    return option.id;
  } else {
    try {
      return JSON.stringify(option);
    } catch (e) {
      return console.warn(
        `[AutocompleteInput warn]: Could not stringify option ` +
          `to generate unique key. Please provide 'getOptionKey' prop ` +
          `to return a unique key for each option.\n`,
      );
    }
  }
};

const defaultGetOptionLabel = (label: string) => (option: any) => {
  if (typeof option === 'object') {
    if (!Object.prototype.hasOwnProperty.call(option, label)) {
      return console.warn(
        `[AutocompleteInput warn]: Label key "option.${label}" does not` +
          ` exist in options object ${JSON.stringify(option)}.\n`,
      );
    }
    return option[label];
  }
  return option;
};

type AutocompleteInputProps<T> = IInputProps & {
  data?: Array<T>;
  label?: string;
  showError?: boolean;
  errorMessage?: string;
  actionsheetLabel?: string;
  loading?: boolean;
  selectedItem?: T;
  autoCompleteKeys?: string[];
  getOptionKey?: (item: T) => string;
  getOptionLabel?: (item: T) => string;
  onItemSelected?: (item: T) => void;
  onChangeText?: (text: string) => void;
};

export default AutocompleteInput;
