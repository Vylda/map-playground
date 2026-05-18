/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import L from 'leaflet';
import {
  parseCoordinatesText,
  toNumericCoords,
  toNumericCoordsArray,
} from './coordsParser';
import geometriesData, { center } from './data';
import {
  assertUnreachable,
  isCircleData,
  isPathData,
  isPointData,
  isPolygonData,
  isPolylineData,
  isRectangleData,
} from './geometryTypeGuards';
import {
  CIRCLE_DEFAULT_FILL_OPACITY,
  CIRCLE_DEFAULT_OPACITY,
  CIRCLE_DEFAULT_RADIUS,
  CROSS_COLOR,
  CROSS_SIZE_PIXELS,
  CROSS_WEIGHT,
  DEFAULT_FILL_OPACITY,
  DEFAULT_OPACITY,
  DEFAULT_WEIGHT,
  MAP_INITIAL_ZOOM,
  MAP_MAX_ZOOM,
  PATH_DEFAULT_OPACITY,
  PATH_DEFAULT_WEIGHT,
  POLYGON_DEFAULT_FILL_OPACITY,
  POLYLINE_DEFAULT_OPACITY,
  RECTANGLE_DEFAULT_FILL_OPACITY,
  RECTANGLE_DEFAULT_WEIGHT,
} from './mapConstants';
import {
  EGeometryType,
  type ICircleData,
  type IPathData,
  type IPointData,
  type IPolygonData,
  type IPolylineData,
  type IRectangleData,
  type TCoords,
  type TGeometryData,
} from './types';

interface ICircleOptions {
  center: TCoords;
  description?: string;
  name?: string;
  radius: number;
}
interface IGeometry {
  layer: TGeometryLayer;
  type: TGeometryData['type'];
}
interface IPointOptions {
  coordinate: TCoords;
  description?: string;
  name?: string;
}
interface IPolygonOptions {
  coordinates: Array<TCoords>;
  description?: string;
  name?: string;
}

type TCircleOptions = ICircleOptions & Omit<L.CircleOptions, 'radius'>;

type TGeometryLayer = L.Circle | L.Marker | L.Polygon | L.Polyline | L.Rectangle;

type TPointOptions = IPointOptions & L.MarkerOptions;

type TPolygonOptions = IPolygonOptions & L.PolylineOptions;

const HTML_ESCAPE_MAP: Record<string, string> = {
  '\n': '<br>',
  '"': '&quot;',
  '&': '&amp;',
  "'": '&#039;',
  '<': '&lt;',
  '>': '&gt;',
};

const HALF_DIVISOR = 2;
const CROSS_HALF_SIZE_PIXELS = CROSS_SIZE_PIXELS / HALF_DIVISOR;

const CROSS_ICON = L.divIcon({
  className: 'map-cross-icon',
  html: `
    <span style="position:absolute;left:0;top:50%;width:${CROSS_SIZE_PIXELS}px;height:${CROSS_WEIGHT}px;background:${CROSS_COLOR};transform:translateY(-50%);"></span>
    <span style="position:absolute;left:50%;top:0;width:${CROSS_WEIGHT}px;height:${CROSS_SIZE_PIXELS}px;background:${CROSS_COLOR};transform:translateX(-50%);"></span>
  `,
  iconAnchor: [CROSS_HALF_SIZE_PIXELS, CROSS_HALF_SIZE_PIXELS],
  iconSize: [CROSS_SIZE_PIXELS, CROSS_SIZE_PIXELS],
});

const escapeHtml = (value: string): string => value
  .replace(/[&"'<>\n]/g, (char) => HTML_ESCAPE_MAP[char]);

const toPopupContent = (name?: string, description?: string): string => [
  name ? `<strong>${escapeHtml(name)}</strong>` : '',
  description ? `<div>${escapeHtml(description)}</div>` : '',
].filter(Boolean).join('');

const bindGeometryText = (
  layer: TGeometryLayer,
  name?: string,
  description?: string,
): void => {
  if (name) {
    layer.bindTooltip(name, {
      direction: 'top',
      sticky: true,
    });
  }

  if (name || description) {
    layer.bindPopup(toPopupContent(name, description));
  }
};

class MapPlayground {
  private crossLayers: Array<L.Marker> = [];

  private geometries: Array<IGeometry> = [];

  private readonly map: L.Map;

  constructor(
    elementId: string,
    initialView: TCoords = center,
    zoom = MAP_INITIAL_ZOOM,
  ) {
    const parsedInitialView = toNumericCoords(initialView);

    this.map = L.map(elementId).setView(parsedInitialView, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: MAP_MAX_ZOOM,
    }).addTo(this.map);
  }

  public addCircle(options: TCircleOptions): L.Circle {
    const parsedCenter = toNumericCoords(options.center);
    const circle = L.circle(parsedCenter, {
      color: options.color || '#0000ff',
      fill: true,
      fillColor: options.fillColor || '#0000ff',
      fillOpacity: options.fillOpacity ?? DEFAULT_FILL_OPACITY,
      opacity: options.opacity ?? DEFAULT_OPACITY,
      radius: options.radius,
      weight: options.weight ?? DEFAULT_WEIGHT,
    }).addTo(this.map);

    this.addCrossAt(parsedCenter);

    bindGeometryText(circle, options.name, options.description);

    this.geometries.push({ layer: circle, type: EGeometryType.CIRCLE });
    this.map.fitBounds(circle.getBounds());

    return circle;
  }

  public addCircleFromString(
    centerString: string,
    radius: number,
    options?: Partial<TCircleOptions>,
  ): L.Circle {
    const parsedCenter = toNumericCoords(centerString);

    return this.addCircle({
      center: parsedCenter,
      radius,
      ...options,
    });
  }

  public addPoint(options: TPointOptions): L.Marker {
    const parsedCoordinate = toNumericCoords(options.coordinate);
    const marker = L.marker(parsedCoordinate, options).addTo(this.map);

    bindGeometryText(marker, options.name, options.description);

    this.geometries.push({ layer: marker, type: EGeometryType.POINT });
    this.map.setView(parsedCoordinate);

    return marker;
  }

  public addPointFromString(
    coordinateString: string,
    options?: Partial<TPointOptions>,
  ): L.Marker {
    const parsedCoordinate = toNumericCoords(coordinateString);

    return this.addPoint({
      coordinate: parsedCoordinate,
      ...options,
    });
  }

  public addPolygon(options: TPolygonOptions): L.Polygon {
    const parsedCoordinates = toNumericCoordsArray(options.coordinates);
    const polygon = L.polygon(parsedCoordinates, {
      color: options.color || '#ff0000',
      fill: true,
      fillColor: options.fillColor || '#ff0000',
      fillOpacity: options.fillOpacity ?? DEFAULT_FILL_OPACITY,
      opacity: options.opacity ?? DEFAULT_OPACITY,
      weight: options.weight ?? DEFAULT_WEIGHT,
    }).addTo(this.map);

    this.addCrossesAt(parsedCoordinates);

    bindGeometryText(polygon, options.name, options.description);

    this.geometries.push({ layer: polygon, type: EGeometryType.POLYGON });
    this.map.fitBounds(polygon.getBounds());

    return polygon;
  }

  public addPolygonFromString(
    coordsString: string,
    options?: Partial<TPolygonOptions>,
  ): L.Polygon {
    const coordinates = parseCoordinatesText(coordsString);

    return this.addPolygon({
      coordinates,
      ...options,
    });
  }

  public clearAll(): void {
    this.crossLayers.forEach((layer) => {
      this.map.removeLayer(layer);
    });
    this.crossLayers = [];

    this.geometries.forEach((g) => {
      this.map.removeLayer(g.layer);
    });
    this.geometries = [];
  }

  public getGeometries(): Array<IGeometry> {
    return [...this.geometries];
  }

  public getGeometryCount(): number {
    return this.geometries.length;
  }

  public getMap(): L.Map {
    return this.map;
  }

  public removeGeometry(index: number): boolean {
    if (index >= 0 && index < this.geometries.length) {
      this.map.removeLayer(this.geometries[index].layer);
      this.geometries.splice(index, 1);

      return true;
    }

    return false;
  }

  public renderAllGeometries(data: Array<TGeometryData>): void {
    data.forEach((geometry) => {
      try {
        const layer = this.renderGeometry(geometry);
        this.geometries.push({
          layer,
          type: geometry.type,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Chyba pri vykreslovani geometrie: ${error.message}`);
        } else {
          console.error('Chyba pri vykreslovani geometrie.');
        }
      }
    });

    if (this.geometries.length > 0) {
      this.map.fitBounds(L.featureGroup(this.geometries.map((g) => g.layer)).getBounds());
    }
  }

  public renderGeometry(data: TGeometryData): TGeometryLayer {
    if (isCircleData(data)) {
      return this.renderCircle(data);
    }

    if (isPathData(data)) {
      return this.renderPath(data);
    }

    if (isPointData(data)) {
      return this.renderPoint(data);
    }

    if (isPolygonData(data)) {
      return this.renderPolygon(data);
    }

    if (isPolylineData(data)) {
      return this.renderPolyline(data);
    }

    if (isRectangleData(data)) {
      return this.renderRectangle(data);
    }

    return assertUnreachable(data);
  }

  private addCrossAt(point: [number, number]): void {
    const cross = L.marker(point, {
      icon: CROSS_ICON,
      interactive: false,
      keyboard: false,
    }).addTo(this.map);

    this.crossLayers.push(cross);
  }

  private addCrossesAt(points: Array<[number, number]>): void {
    points.forEach((point) => {
      this.addCrossAt(point);
    });
  }

  private renderCircle(data: ICircleData): L.Circle {
    const parsedCenter = toNumericCoords(data.center);

    const layer = L.circle(parsedCenter, {
      color: data.color || '#3498DB',
      fill: true,
      fillColor: data.fillColor || '#3498DB',
      fillOpacity: data.fillOpacity ?? CIRCLE_DEFAULT_FILL_OPACITY,
      opacity: data.opacity ?? CIRCLE_DEFAULT_OPACITY,
      radius: data.radius || CIRCLE_DEFAULT_RADIUS,
      weight: data.weight ?? DEFAULT_WEIGHT,
    }).addTo(this.map);

    this.addCrossAt(parsedCenter);

    bindGeometryText(layer, data.name, data.description);

    return layer;
  }

  private renderPath(data: IPathData): L.Polyline {
    const parsedCoordinates = toNumericCoordsArray(data.coordinates);

    const layer = L.polyline(parsedCoordinates, {
      color: data.color || '#9B59B6',
      lineCap: data.lineCap,
      lineJoin: data.lineJoin,
      opacity: data.opacity ?? PATH_DEFAULT_OPACITY,
      weight: data.weight ?? PATH_DEFAULT_WEIGHT,
    }).addTo(this.map);

    this.addCrossesAt(parsedCoordinates);

    bindGeometryText(layer, data.name, data.description);

    return layer;
  }

  private renderPoint(data: IPointData): L.Marker {
    const parsedCoordinate = toNumericCoords(data.coordinate);

    const layer = L.marker(parsedCoordinate).addTo(this.map);

    bindGeometryText(layer, data.name, data.description);

    return layer;
  }

  private renderPolygon(data: IPolygonData): L.Polygon {
    const parsedCoordinates = toNumericCoordsArray(data.coordinates);

    const layer = L.polygon(parsedCoordinates, {
      color: data.color || '#2ECC71',
      fill: true,
      fillColor: data.fillColor || '#2ECC71',
      fillOpacity: data.fillOpacity ?? POLYGON_DEFAULT_FILL_OPACITY,
      opacity: data.opacity ?? DEFAULT_OPACITY,
      weight: data.weight ?? DEFAULT_WEIGHT,
    }).addTo(this.map);

    this.addCrossesAt(parsedCoordinates);

    bindGeometryText(layer, data.name, data.description);

    return layer;
  }

  private renderPolyline(data: IPolylineData): L.Polyline {
    const parsedCoordinates = toNumericCoordsArray(data.coordinates);

    const layer = L.polyline(parsedCoordinates, {
      color: data.color || '#FF6B6B',
      dashArray: data.dashArray,
      lineCap: data.lineCap,
      lineJoin: data.lineJoin,
      opacity: data.opacity ?? POLYLINE_DEFAULT_OPACITY,
      weight: data.weight ?? DEFAULT_WEIGHT,
    }).addTo(this.map);

    this.addCrossesAt(parsedCoordinates);

    bindGeometryText(layer, data.name, data.description);

    return layer;
  }

  private renderRectangle(data: IRectangleData): L.Rectangle {
    const parsedBounds = toNumericCoordsArray(data.bounds);
    const [northWest, southEast] = parsedBounds;
    const [northLatitude, westLongitude] = northWest;
    const [southLatitude, eastLongitude] = southEast;
    const rectangleCorners: Array<[number, number]> = [
      [northLatitude, westLongitude],
      [northLatitude, eastLongitude],
      [southLatitude, eastLongitude],
      [southLatitude, westLongitude],
    ];

    const layer = L.rectangle(parsedBounds, {
      color: data.color || '#E74C3C',
      fill: true,
      fillColor: data.fillColor || '#E74C3C',
      fillOpacity: data.fillOpacity ?? RECTANGLE_DEFAULT_FILL_OPACITY,
      opacity: data.opacity ?? DEFAULT_OPACITY,
      weight: data.weight ?? RECTANGLE_DEFAULT_WEIGHT,
    }).addTo(this.map);

    this.addCrossesAt(rectangleCorners);

    bindGeometryText(layer, data.name, data.description);

    return layer;
  }
}

const app = new MapPlayground('map');
app.renderAllGeometries(geometriesData);

const browserApi = {
  addCircle: (
    centerString: string,
    radius: number,
    options?: Partial<TCircleOptions>,
  ): L.Circle => app.addCircleFromString(centerString, radius, options),
  addPoint: (
    coordinateString: string,
    options?: Partial<TPointOptions>,
  ): L.Marker => app.addPointFromString(coordinateString, options),
  addPolygon: (
    coordsString: string,
    options?: Partial<TPolygonOptions>,
  ): L.Polygon => app.addPolygonFromString(coordsString, options),
  clearAll: (): void => {
    app.clearAll();
  },
  getGeometries: (): Array<IGeometry> => app.getGeometries(),
  getGeometryCount: (): number => app.getGeometryCount(),
  map: app,
  removeGeometry: (index: number): boolean => app.removeGeometry(index),
};

Object.assign(window, browserApi);

console.warn('Map Playground inicialisovan');
console.warn('API dostupne na window: map, addPolygon, addCircle, addPoint, clearAll, getGeometries, getGeometryCount, removeGeometry');
