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
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ListRenderItem, ListRenderItemInfo} from 'react-native';
import {mapToData, useFastSearch} from '@/utils/hooks/use_fast_search';

export const AutocompleteInput = <T extends unknown>(
  props: AutocompleteInputProps<T>,
) => {
  const {
    getData,
    label,
    autoCompleteKeys,
    getOptionKey = defaultGetOptionKey as (item: T, i: number) => string,
    getOptionLabel = defaultGetOptionLabel(label || 'label'),
    onItemSelected = () => {},
    onChangeText: onChangeTextProp,
    actionsheetLabel,
    selectedItem,
    showError,
    errorMessage,
    useReturnedMatch,
    loadingMsg,
    ...inputProps
  } = props;
  const {isOpen, onOpen, onClose} = useDisclose();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getData()
        .then(setData)
        .then(() => {
          if (!unmounted.current) {
            setLoading(false);
          }
        })
        .catch(console.log);
    } else {
      setData([]);
      setLoading(false);
    }
  }, [getData, isOpen]);

  const [inputVal, setInputVal] = useState<string>('');

  const {results, setSearchTerm} = useFastSearch(data, {
    keys: autoCompleteKeys,
  });

  const mappedResults = useMemo(
    () => mapToData(results, data),
    [results, data],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateSearchTerm = useCallback(
    debounce((newTerm: string) => {
      setSearchTerm(newTerm);
    }, 200),
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
    (listItem: ListRenderItemInfo<T>) => {
      let newItem = listItem.item;
      if (typeof listItem.item === 'object') {
        newItem = {...listItem.item};
        if (useReturnedMatch) {
          (newItem as any).selectedName = results[listItem.index].value;
        }
      }
      onItemSelected && onItemSelected(newItem);
      onClose();
      setInputVal('');
    },
    [onItemSelected, onClose, useReturnedMatch, results],
  );

  const textValue = useMemo(() => {
    if (selectedItem) {
      return getOptionLabel(selectedItem);
    }
    return '';
  }, [getOptionLabel, selectedItem]);

  const memoRenderItem: ListRenderItem<T> = useCallback(
    listItemInfo => (
      <Actionsheet.Item onPress={onListItemPressed.bind(this, listItemInfo)}>
        {useReturnedMatch
          ? results[listItemInfo.index].value
          : getOptionLabel(listItemInfo.item)}
        {useReturnedMatch && results[listItemInfo.index].firstValue
          ? `(${results[listItemInfo.index].firstValue})`
          : undefined}
      </Actionsheet.Item>
    ),
    [getOptionLabel, onListItemPressed, results, useReturnedMatch],
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
                ) : loading ? (
                  <Text color="gray.500" fontSize="xl">
                    {loadingMsg ? loadingMsg : t`Loading`}
                  </Text>
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
              data={mappedResults}
              renderItem={memoRenderItem}
              keyExtractor={getOptionKey}
            />
          </KeyboardAvoidingView>
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  );
};

function defaultGetOptionKey(option: any) {
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
}

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
  getData: () => Promise<Array<T>>;
  label?: string;
  showError?: boolean;
  errorMessage?: string;
  loadingMsg?: string;
  actionsheetLabel?: string;
  selectedItem?: T;
  autoCompleteKeys?: string[];
  getOptionKey?: (item: T) => string;
  getOptionLabel?: (item: T) => string;
  onItemSelected?: (item: T) => void;
  onChangeText?: (text: string) => void;
  useReturnedMatch?: boolean;
};

export default AutocompleteInput;
