import {
  EGeometryType,
  type ICircleData,
  type IPathData,
  type IPointData,
  type IPolygonData,
  type IPolylineData,
  type IRectangleData,
  type TGeometryData,
} from './types';

export const assertUnreachable = (value: never): never => {
  throw new Error(`Neznamy typ geometrie: ${String(value)}`);
};

export const isCircleData = (data: TGeometryData): data is ICircleData => {
  const isCircle = data.type === EGeometryType.CIRCLE;

  return isCircle;
};

export const isPathData = (data: TGeometryData): data is IPathData => {
  const isPath = data.type === EGeometryType.PATH;

  return isPath;
};

export const isPointData = (data: TGeometryData): data is IPointData => {
  const isPoint = data.type === EGeometryType.POINT;

  return isPoint;
};

export const isPolygonData = (data: TGeometryData): data is IPolygonData => {
  const isPolygon = data.type === EGeometryType.POLYGON;

  return isPolygon;
};

export const isPolylineData = (data: TGeometryData): data is IPolylineData => {
  const isPolyline = data.type === EGeometryType.POLYLINE;

  return isPolyline;
};

export const isRectangleData = (data: TGeometryData): data is IRectangleData => {
  const isRectangle = data.type === EGeometryType.RECTANGLE;

  return isRectangle;
};
