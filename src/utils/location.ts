import type {LocationDetail} from '@/store/calculation';

export function getLocationLabel(location?: LocationDetail) {
  if (location) {
    let label =
      location.label ||
      location.city?.selectedName ||
      location.city?.name ||
      '';

    if (!label) {
      if (location.lat && location.long) {
        const latString =
          Math.abs(location.lat).toFixed(2) +
          (location.lat > 0 ? '° N' : '° S');
        const longString =
          Math.abs(location.long).toFixed(2) +
          (location.long > 0 ? '° E' : '° W');
        return latString + ', ' + longString;
      }
    }

    return label;
  } else {
    return '';
  }
}
