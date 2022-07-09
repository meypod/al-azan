import {debounce} from 'lodash';
import {
  FlatList,
  Input,
  View,
  IInputProps,
  ScrollView,
  Text,
} from 'native-base';
import {useCallback, useEffect, useRef, useState} from 'react';
import {
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TouchableWithoutFeedback,
} from 'react-native';
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
    clearOnSelect = true,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    isInsideScrollView = false,
    ...inputProps
  } = props;

  const FlatListWrapper = isInsideScrollView ? ScrollView : View;

  const [showResults, setShowResults] = useState<boolean>(!!data?.length);
  const [inputVal, setInputVal] = useState<string>('');
  const [hideResults, setHideResults] = useState<boolean>(false);

  const flatlistRef = useRef();

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
      setHideResults(false);
      onChangeTextProp && onChangeTextProp(text);
    },
    [onChangeTextProp, updateSearchTerm],
  );

  const onListItemPressed = useCallback(
    (item: T) => {
      onItemSelected && onItemSelected(item);
      setHideResults(true);
      setShowResults(false);
      if (clearOnSelect) {
        setInputVal('');
      }
    },
    [onItemSelected, clearOnSelect],
  );

  const onBlur = useCallback(
    (e?: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setShowResults(false);
      setHideResults(true);
      e && onBlurProp && onBlurProp(e);
    },
    [onBlurProp],
  );

  const onFocus = useCallback(
    (e?: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setHideResults(false);
      e && onFocusProp && onFocusProp(e);
    },
    [onFocusProp],
  );

  useEffect(() => {
    setShowResults(!!results?.length && !!inputVal);
  }, [results, inputVal]);

  return (
    <View flex={1}>
      <View position="relative">
        <Input
          width="100%"
          onBlur={onBlur}
          onFocus={onFocus}
          onChangeText={onChangeText}
          value={inputVal}
          {...inputProps}
        />
        {!hideResults && showResults && (
          <FlatListWrapper
            keyboardShouldPersistTaps="handled"
            _dark={{
              bgColor: 'light.900',
            }}
            _light={{
              bgColor: 'light.200',
            }}
            horizontal={true}
            contentContainerStyle={{flexGrow: 1}}
            position="absolute"
            zIndex={1}
            width="100%"
            maxHeight="100"
            top="100%"
            borderBottomRadius={5}>
            <FlatList
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps={'handled'}
              ref={flatlistRef}
              data={results}
              renderItem={listItemInfo => (
                <TouchableWithoutFeedback
                  onPress={() => onListItemPressed(listItemInfo.item)}>
                  <Text p="1">{getOptionLabel(listItemInfo.item)}</Text>
                </TouchableWithoutFeedback>
              )}
              keyExtractor={getOptionKey}></FlatList>
          </FlatListWrapper>
        )}
      </View>
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
  autoCompleteKeys?: string[];
  getOptionKey?: (item: T) => string;
  getOptionLabel?: (item: T) => string;
  onItemSelected?: (item: T) => void;
  onChangeText?: (text: string) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  clearOnSelect?: boolean;
  isInsideScrollView?: boolean;
};

export default AutocompleteInput;
