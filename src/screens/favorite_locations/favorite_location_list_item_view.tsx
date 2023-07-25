import {t} from '@lingui/macro';
import {HStack, Text, Button} from 'native-base';
import {memo, useMemo} from 'react';
import {TouchableNativeFeedback} from 'react-native';
import {ScaleDecorator} from 'react-native-draggable-flatlist';
import {CheckIcon} from '@/assets/icons/material_icons/check';
import {DeleteIcon} from '@/assets/icons/material_icons/delete';
import {EditIcon} from '@/assets/icons/material_icons/edit';
import {FavoriteLocation} from '@/store/favorite_locations';

export const FavoriteLocationListItemView = memo(
  function FavoriteLocationListItemView({
    item,
    selectedItem,
    onEditPress,
    onDeletePress,
    onPress,
    drag,
    dragging,
  }: {
    item: FavoriteLocation;
    selectedItem: FavoriteLocation;
    onEditPress: (favorite: FavoriteLocation) => void;
    onDeletePress: (favorite: FavoriteLocation) => void;
    onPress: (favorite: FavoriteLocation) => void;
    drag: () => void;
    dragging: boolean;
  }) {
    const isSelected = useMemo(
      () => item.id === selectedItem.id,
      [selectedItem, item],
    );

    return (
      <ScaleDecorator activeScale={1.05}>
        <TouchableNativeFeedback
          onPress={onPress.bind(null, item)}
          onLongPress={drag}>
          <HStack
            mb="2"
            bgColor="light.50"
            shadow="2"
            _dark={{
              bgColor: dragging ? 'gray.800:alpha.90' : 'gray.800',
            }}
            borderRadius={4}
            justifyContent="space-between"
            alignItems="stretch"
            p="1">
            <HStack alignItems="center" flex={1}>
              <CheckIcon
                mx="1"
                size="md"
                color={isSelected ? 'green.500' : 'transparent'}
                accessibilityLabel={isSelected ? t`Selected` : ''}
              />
              <Text fontSize="lg" flex={1} flexGrow={1} noOfLines={1}>
                {item.label || item.city?.selectedName || item.city?.name}
              </Text>
            </HStack>
            <HStack>
              <Button
                accessibilityLabel={t`Edit`}
                onPress={onEditPress.bind(null, item)}
                variant="ghost"
                px="2">
                <EditIcon
                  color="coolGray.300"
                  size="xl"
                  _light={{color: 'coolGray.600'}}
                />
              </Button>
              <Button
                onPress={onDeletePress.bind(null, item)}
                variant="ghost"
                px="2"
                accessibilityLabel={t`Delete`}>
                <DeleteIcon color="red.500" size="xl" />
              </Button>
            </HStack>
          </HStack>
        </TouchableNativeFeedback>
      </ScaleDecorator>
    );
  },
);
