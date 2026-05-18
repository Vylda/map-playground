import { MINUTES_TO_DEGREES_DIVISOR } from './mapConstants';
import type { TCoords } from './types';

const COORDINATE_PARTS_COUNT = 2;
const LATITUDE_MAX_DEGREES = 90;
const LONGITUDE_MAX_DEGREES = 180;
const MAX_MINUTES = 60;

const DIRECTIONAL_COORDS_REGEX = /^\s*([NS])\s*(\d{1,2})(?:°|\s)?\s*(\d{1,2}(?:[.,]\d+)?)(?:[:'])?\s*([EW])\s*(\d{1,3})(?:°|\s)?\s*(\d{1,2}(?:[.,]\d+)?)(?:[:'])?\s*$/i;

type TNumericCoords = [number, number];

const toFloat = (value: string): number => Number.parseFloat(value.replace(',', '.'));

const validateMinutes = (minutes: number): void => {
  if (!Number.isFinite(minutes) || minutes < 0 || minutes >= MAX_MINUTES) {
    throw new Error('Minuty musí být v rozsahu 0 až 59.999...');
  }
};

const toDecimalDegrees = (
  degrees: number,
  minutes: number,
): number => degrees + minutes / MINUTES_TO_DEGREES_DIVISOR;

const parseCoordinateComponent = (raw: string): number => {
  const normalized = raw
    .trim()
    .replace(/°/g, ' ')
    .replace(/,/g, '.')
    .replace(/[:']/g, '');
  const parts = normalized.split(/[\s]+/).filter(Boolean);

  if (parts.length === 1) {
    const decimalValue = Number.parseFloat(parts[0]);

    if (!Number.isFinite(decimalValue)) {
      throw new Error(`Neplatná číselná hodnota souřadnice: ${raw}`);
    }

    return decimalValue;
  }

  if (parts.length === COORDINATE_PARTS_COUNT) {
    const degrees = Number.parseFloat(parts[0]);
    const minutes = Number.parseFloat(parts[1]);

    if (!Number.isFinite(degrees) || !Number.isFinite(minutes)) {
      throw new Error(`Neplatná číselná hodnota souřadnice: ${raw}`);
    }

    validateMinutes(minutes);

    return toDecimalDegrees(degrees, minutes);
  }

  throw new Error(`Neznámý formát souřadnice: ${raw}`);
};

const parseDirectionalCoordinates = (raw: string): null | TNumericCoords => {
  const match = DIRECTIONAL_COORDS_REGEX.exec(raw);

  if (!match) {
    return null;
  }

  const [
    ,
    latitudeDirection,
    latitudeDegreesRaw,
    latitudeMinutesRaw,
    longitudeDirection,
    longitudeDegreesRaw,
    longitudeMinutesRaw,
  ] = match;

  const latitudeDegrees = Number.parseInt(latitudeDegreesRaw, 10);
  const latitudeMinutes = toFloat(latitudeMinutesRaw);
  const longitudeDegrees = Number.parseInt(longitudeDegreesRaw, 10);
  const longitudeMinutes = toFloat(longitudeMinutesRaw);

  validateMinutes(latitudeMinutes);
  validateMinutes(longitudeMinutes);

  if (latitudeDegrees > LATITUDE_MAX_DEGREES) {
    throw new Error('Šířka je mimo rozsah 0-90°');
  }

  if (longitudeDegrees > LONGITUDE_MAX_DEGREES) {
    throw new Error('Délka je mimo rozsah 0-180°');
  }

  const latitudeSign = latitudeDirection.toUpperCase() === 'S' ? -1 : 1;
  const longitudeSign = longitudeDirection.toUpperCase() === 'W' ? -1 : 1;

  const latitude = latitudeSign * toDecimalDegrees(latitudeDegrees, latitudeMinutes);
  const longitude = longitudeSign * toDecimalDegrees(longitudeDegrees, longitudeMinutes);

  return [latitude, longitude];
};

export const toNumericCoords = (value: TCoords): TNumericCoords => {
  if (Array.isArray(value)) {
    const [latitude, longitude] = value;

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error('Souřadnice v poli musí být čísla.');
    }

    return [latitude, longitude];
  }

  const directionalCoords = parseDirectionalCoordinates(value);

  if (directionalCoords) {
    return directionalCoords;
  }

  const parts = value.split(',').map((part) => part.trim());

  if (parts.length !== COORDINATE_PARTS_COUNT) {
    throw new Error('Neznámý formát souřadnic. Očekáváno "lat,lon" nebo "N.. E..".');
  }

  return [parseCoordinateComponent(parts[0]), parseCoordinateComponent(parts[1])];
};

export const toNumericCoordsArray = (values: Array<TCoords>): Array<TNumericCoords> => values
  .map((value) => toNumericCoords(value));

export const parseCoordinatesText = (value: string): Array<TNumericCoords> => value
  .split(';')
  .map((part) => part.trim())
  .filter((part) => part.length > 0)
  .map((part) => toNumericCoords(part));
