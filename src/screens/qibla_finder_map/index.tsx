import {t} from '@lingui/macro';
import MapLibreGL, {
  ShapeSourceProps,
  Logger,
} from '@maplibre/maplibre-react-native';
import {Coordinates, Qibla} from 'adhan-extended';
import debounce from 'lodash/debounce';
import {Button, HStack, Text} from 'native-base';
import {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, View, TextInput as NativeInput} from 'react-native';
import {CheckIcon} from '@/assets/icons/material_icons/check';
import {CloseIcon} from '@/assets/icons/material_icons/close';
import {ExploreIcon} from '@/assets/icons/material_icons/explore';
import {SafeArea} from '@/components/safe_area';
import Compass, {setUpdateRate} from '@/modules/compass';
import {calcSettings} from '@/store/calculation';

if (MapLibreGL) {
  // Will be null for most users (only Mapbox authenticates this way).
  // Required on Android. See Android installation notes.
  MapLibreGL.setAccessToken(null);
  Logger.setLogLevel('none' as any);
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  map: {
    flex: 1,
    alignSelf: 'stretch',
  },
});

const mapStyle = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      // this is the preferred url: https://github.com/openstreetmap/operations/issues/737
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap Contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm', // This must match the source key above
    },
  ],
};

function getLineGeoJson(from: number[], to: number[]) {
  const geojson: ShapeSourceProps['shape'] = {
    type: 'LineString',
    coordinates: [from, to],
  };
  return geojson;
}

function getDirectionSecondPoint({
  lat,
  long,
  degree,
  distance = 10,
}: {
  lat: number;
  long: number;
  degree: number;
  /** in kilometers */
  distance?: number;
}) {
  // assumes degree is between 0-360 degrees from north clockwise
  const bearing = (degree * Math.PI) / 180;
  const R = 6371; // radius of Earth in KM

  const latRad = (lat * Math.PI) / 180;
  const longRad = (long * Math.PI) / 180;

  const latitude2 = Math.asin(
    Math.sin(latRad) * Math.cos(distance / R) +
      Math.cos(latRad) * Math.sin(distance / R) * Math.cos(bearing),
  );
  const longitude2 =
    longRad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distance / R) * Math.cos(latRad),
      Math.cos(distance / R) - Math.sin(latRad) * Math.sin(latitude2),
    );

  return {
    lat: (latitude2 * 180) / Math.PI,
    long: (longitude2 * 180) / Math.PI,
  };
}

export function QiblaMap() {
  const compassDegree = useRef(0);
  const qiblaDegree = useRef(0);
  const cameraRef = useRef<MapLibreGL.Camera>();
  const coords = useRef<number[]>([0, 0]);
  const [qiblaDirCoords, setQiblaDirCoords] = useState<number[]>([0, 0]);
  const [userDirCoords, setUserDirCoords] = useState<number[]>([0, 0]);
  const wasFacingKaaba = useRef(false);
  const [isFacingKaaba, setIsFacingKaaba] = useState(false);
  const [compassLock, setCompassLock] = useState(false);
  const compassLockRef = useRef(false);
  const gotLocationOnce = useRef(false);
  const turnHintRef = useRef<NativeInput>(null);
  const turnLeft = useRef(t`Turn Left`);
  const turnRight = useRef(t`Turn Right`);

  const updateCamera = useCallback(() => {
    const qiblaSecondPoint = getDirectionSecondPoint({
      lat: coords.current[1],
      long: coords.current[0],
      degree: qiblaDegree.current,
    });

    const userSecondPoint = getDirectionSecondPoint({
      lat: coords.current[1],
      long: coords.current[0],
      degree: compassDegree.current,
    });

    setQiblaDirCoords([qiblaSecondPoint.long, qiblaSecondPoint.lat]);
    setUserDirCoords([userSecondPoint.long, userSecondPoint.lat]);

    let facingKaaba = false;
    if (Math.abs(compassDegree.current - qiblaDegree.current) < 1) {
      facingKaaba = true;
    }
    if (wasFacingKaaba.current !== facingKaaba) {
      wasFacingKaaba.current = facingKaaba;
      setIsFacingKaaba(facingKaaba);
    }

    if (compassLockRef.current) {
      cameraRef.current?.setCamera({
        heading: compassDegree.current,
        centerCoordinate: coords.current,
      });
    } else {
      cameraRef.current?.setCamera({
        centerCoordinate: coords.current,
      });
    }

    if (turnHintRef.current) {
      if (compassDegree.current < qiblaDegree.current) {
        turnHintRef.current.setNativeProps({text: turnRight.current});
      } else {
        turnHintRef.current.setNativeProps({text: turnLeft.current});
      }
    }
  }, []);

  useEffect(() => {
    setUpdateRate(__DEV__ ? 500 : 60);
    if (compassLock) {
      const sub = Compass.addListener('heading', h => {
        compassDegree.current = h;
        updateCamera();
      });
      return () => sub.remove();
    }
    return () => {};
  }, [updateCamera, compassLock]);

  const onUserLocationUpdate = useCallback(
    (location: MapLibreGL.Location) => {
      coords.current = [location.coords.longitude, location.coords.latitude];
      qiblaDegree.current = Qibla(
        new Coordinates(location.coords.latitude, location.coords.longitude),
      );
      updateCamera();
    },
    [updateCamera],
  );

  useEffect(() => {
    if (gotLocationOnce.current) return;
    const {LOCATION} = calcSettings.getState();
    if (LOCATION?.lat && LOCATION.long) {
      gotLocationOnce.current = true;
      onUserLocationUpdate({
        coords: {latitude: LOCATION?.lat, longitude: LOCATION.long},
      });
    }
  }, [onUserLocationUpdate]);

  const toggleCompassLock = useCallback(() => {
    compassLockRef.current = !compassLockRef.current;
    setCompassLock(compassLockRef.current);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCameraUpdate = useCallback(
    debounce(() => {
      updateCamera();
    }, 150),
    [],
  );

  if (!MapLibreGL) {
    return <View></View>;
  }

  return (
    <SafeArea>
      <View style={styles.page}>
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            zIndex: 1,
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}>
          <Button
            mb="1"
            mr="1"
            px="1"
            backgroundColor={compassLock ? 'primary.900' : 'black:alpha.60'}
            h="10"
            borderColor={compassLock ? 'primary.400' : 'black:alpha.50'}
            borderWidth={1}
            size="sm"
            onPress={toggleCompassLock}>
            <HStack alignItems="center">
              <Text
                fontSize="sm"
                color={
                  compassLock ? 'primary.400' : 'white'
                }>{t`Compass Lock`}</Text>
              <ExploreIcon
                ml="1"
                color={compassLock ? 'primary.400' : 'white'}
                size="2xl"
              />
            </HStack>
          </Button>
          <View
            style={{
              backgroundColor: '#00000099',
            }}>
            <Text background="red" padding="1" color="white" fontSize="xs">
              &copy; OpenStreetMap Contributors
            </Text>
          </View>
        </View>
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 10,
            width: '100%',
            opacity: compassLock ? 1 : 0.001,
            flexDirection: 'column',
          }}>
          <View
            accessibilityRole="text"
            aria-live="polite"
            accessibilityLiveRegion="polite"
            accessible
            accessibilityLabel={
              isFacingKaaba
                ? t`You are facing Kaaba`
                : t`You are not facing Kaaba`
            }
            style={{
              justifyContent: 'center',
              flexDirection: 'row',
            }}>
            <View
              style={{
                backgroundColor: '#00000099',
              }}>
              {isFacingKaaba ? (
                <CheckIcon size="6xl" color="#59cf78" />
              ) : (
                <CloseIcon size="6xl" color="red.400" />
              )}
            </View>
          </View>
          <View>
            <NativeInput
              style={{height: 70, opacity: 0.001}}
              accessible={false}
              aria-live="polite"
              accessibilityLiveRegion="polite"
              ref={turnHintRef}
              aria-hidden={true}
              editable={false}
              aria-disabled={false}
              aria-modal={false}
              accessibilityHint=""
              accessibilityRole="text"
            />
          </View>
        </View>
        <MapLibreGL.MapView
          accessibilityElementsHidden
          accessibilityHint=""
          accessibilityLabel=""
          accessible={false}
          style={styles.map}
          attributionEnabled={true}
          attributionPosition={{left: 5, bottom: 5}}
          logoEnabled={false}
          zoomEnabled={true}
          pitchEnabled={false}
          scrollEnabled={false}
          rotateEnabled={true}
          compassEnabled={!compassLock}
          localizeLabels={true}
          onTouchEnd={debouncedCameraUpdate}
          onDidFinishRenderingMapFully={updateCamera}>
          {/* @ts-ignore */}
          <MapLibreGL.Style json={mapStyle} />
          <MapLibreGL.Camera
            // @ts-ignore
            ref={cameraRef}
            zoomLevel={10}
            minZoomLevel={12}
          />
          <MapLibreGL.UserLocation
            visible={true}
            showsUserHeadingIndicator={false}
            renderMode="normal"
            onUpdate={onUserLocationUpdate}
          />
          <MapLibreGL.ShapeSource
            id="qibla_line"
            shape={getLineGeoJson(coords.current, qiblaDirCoords)}
          />
          <MapLibreGL.ShapeSource
            id="user_line"
            shape={getLineGeoJson(coords.current, userDirCoords)}
          />
          <MapLibreGL.LineLayer
            id="qibla_line_highlight"
            sourceID="qibla_line"
            style={{
              lineCap: 'round',
              lineJoin: 'round',
              lineColor: '#444',
              lineWidth: 10,
            }}
          />
          <MapLibreGL.LineLayer
            id="qibla_line_layer"
            sourceID="qibla_line"
            style={{
              lineCap: 'round',
              lineJoin: 'round',
              lineColor: '#ffdd00',
              lineWidth: 3,
            }}
          />
          {compassLock ? (
            <MapLibreGL.LineLayer
              id="user_line_layer"
              sourceID="user_line"
              style={{
                lineCap: 'round',
                lineJoin: 'round',
                lineColor: isFacingKaaba ? '#59cf78' : '#000',
                lineWidth: 3,
              }}
            />
          ) : undefined}
        </MapLibreGL.MapView>
      </View>
    </SafeArea>
  );
}
