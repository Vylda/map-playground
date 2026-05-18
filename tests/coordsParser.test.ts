import assert from 'node:assert/strict';
import test from 'node:test';

import {
  parseCoordinatesText,
  toNumericCoords,
  toNumericCoordsArray,
} from '../coordsParser';

const EPSILON = 1e-9;

const assertApprox = (actual: number, expected: number): void => {
  const delta = Math.abs(actual - expected);

  assert.ok(
    delta < EPSILON,
    `Expected ${actual} to be approximately ${expected}. Delta: ${delta}`,
  );
};

test('parses canonical directional format', () => {
  const [lat, lon] = toNumericCoords('N 49° 12.828 E 016° 35.038');

  assertApprox(lat, 49.2138);
  assertApprox(lon, 16.583966666666666);
});

test('parses directional format without spaces', () => {
  const [lat, lon] = toNumericCoords('N49°12.828E016°35.038');

  assertApprox(lat, 49.2138);
  assertApprox(lon, 16.583966666666666);
});

test('parses directional format without degree sign', () => {
  const [lat, lon] = toNumericCoords('N49 12.828E016 35.038');

  assertApprox(lat, 49.2138);
  assertApprox(lon, 16.583966666666666);
});

test('parses decimal comma and minutes suffix', () => {
  const [lat, lon] = toNumericCoords("N49 12,828:E016 35,038:");

  assertApprox(lat, 49.2138);
  assertApprox(lon, 16.583966666666666);
});

test('parses south/west directional values as negatives', () => {
  const [lat, lon] = toNumericCoords('S49°12.000 W016°30.000');

  assertApprox(lat, -49.2);
  assertApprox(lon, -16.5);
});

test('parses legacy lat/lon format', () => {
  const [lat, lon] = toNumericCoords('49 12.828,16 35.038');

  assertApprox(lat, 49.2138);
  assertApprox(lon, 16.583966666666666);
});

test('parses semicolon-separated coordinate list', () => {
  const coords = parseCoordinatesText('N49 12.000 E016 35.000; 49 13.000,16 36.000');

  assert.equal(coords.length, 2);
  assertApprox(coords[0][0], 49.2);
  assertApprox(coords[0][1], 16.583333333333332);
  assertApprox(coords[1][0], 49.21666666666667);
  assertApprox(coords[1][1], 16.6);
});

test('converts mixed coord array', () => {
  const coords = toNumericCoordsArray([
    [49.5, 14.4],
    'N49 12.000 E016 35.000',
  ]);

  assert.equal(coords.length, 2);
  assertApprox(coords[0][0], 49.5);
  assertApprox(coords[0][1], 14.4);
  assertApprox(coords[1][0], 49.2);
  assertApprox(coords[1][1], 16.583333333333332);
});
