/**
 * Typy geometrií dostupné v mapě
 */
export enum EGeometryType {
  CIRCLE = 'circle',
  PATH = 'path',
  POINT = 'point',
  POLYGON = 'polygon',
  POLYLINE = 'polyline',
  RECTANGLE = 'rectangle',
}

/**
 * Společné vlastnosti pro všechny geometrie
 */
export interface IBaseGeometryOptions {
  description?: string;
  name?: string;
}

/**
 * Circle - kruh
 * center: [lat, lng]
 * radius: poloměr v metrech
 */
export interface ICircleData extends IClosedShapeOptions {
  center: TCoords;
  radius: number;
  type: EGeometryType.CIRCLE;
}

/**
 * Vlastnosti pro uzavřené tvary (Polygon, Rectangle, Circle)
 */
export interface IClosedShapeOptions extends IOpenShapeOptions {
  fillColor?: string;
  fillOpacity?: number;
}

/**
 * Vlastnosti pro otevřené tvary (Path, Polyline)
 */
export interface IOpenShapeOptions extends IBaseGeometryOptions {
  color?: string;
  dashArray?: string;
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'bevel' | 'miter' | 'round';
  opacity?: number;
  weight?: number;
}

/**
 * Path - základní třída (pro pokročilé případy)
 * Je to obecný typ pro vlastní cesty
 */
export interface IPathData extends IOpenShapeOptions {
  coordinates: Array<TCoords>;
  type: EGeometryType.PATH;
}

/**
 * Point - bod v mapě
 * coordinate: [lat, lng]
 */
export interface IPointData extends IBaseGeometryOptions {
  coordinate: TCoords;
  type: EGeometryType.POINT;
}

/**
 * Polygon - uzavřený polygon
 * Souřadnice: pole [lat, lng] párů
 */
export interface IPolygonData extends IClosedShapeOptions {
  coordinates: Array<TCoords>;
  type: EGeometryType.POLYGON;
}

/**
 * Polyline - otevřená čára
 * Souřadnice: pole [lat, lng] párů
 */
export interface IPolylineData extends IOpenShapeOptions {
  coordinates: Array<TCoords>;
  type: EGeometryType.POLYLINE;
}

/**
 * Rectangle - obdélník
 * bounds: [[lat1, lng1], [lat2, lng2]]
 */
export interface IRectangleData extends IClosedShapeOptions {
  bounds: Array<TCoords>;
  type: EGeometryType.RECTANGLE;
}

export type TCoords = [lat: number, lon: number] | string;

/**
 * Typ pro jakoukoli geometrii
 */
export type TGeometryData = ICircleData
  | IPathData
  | IPointData
  | IPolygonData
  | IPolylineData
  | IRectangleData;
