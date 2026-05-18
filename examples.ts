import {
  EGeometryType,
  type TCoords,
  type TGeometryData,
} from './types';

export const center = 'N 49° 12.828 E 016° 35.038' satisfies TCoords;

/**
 * Připravená data s příklady všech typů geometrií
 */
const geometriesData: Array<TGeometryData> = [
  // Příklad: Point - klasický pin v mapě
  {
    coordinate: center,
    description: 'Samostatný bod reprezentovaný pinem',
    name: 'Bod - Pin',
    type: EGeometryType.POINT,
  },

  // Příklad: Polyline - otevřená čára (cesta mezi místy)
  {
    color: '#FF6B6B',
    coordinates: [
      [49.5, 14.4],
      [49.505, 14.41],
      [49.51, 14.4],
      [49.515, 14.425],
    ],
    dashArray: '5, 5',
    description: 'Otevřená cesta - bez uzavření',
    name: 'Cesta 1',
    opacity: 0.8,
    type: EGeometryType.POLYLINE,
    weight: 3,
  },

  // Příklad: Polygon - uzavřený polygon
  {
    color: '#2ECC71',
    coordinates: [
      [49.52, 14.45],
      [49.525, 14.46],
      [49.52, 14.465],
      [49.515, 14.46],
    ],
    description: 'Uzavřený polygon s barvou pozadí',
    fillColor: '#2ECC71',
    fillOpacity: 0.3,
    name: 'Polygon - Park',
    opacity: 1,
    type: EGeometryType.POLYGON,
    weight: 2,
  },

  // Příklad: Rectangle - obdélník
  {
    bounds: [
      [49.48, 14.38],
      [49.49, 14.405],
    ],
    color: '#E74C3C',
    description: 'Obdélníková oblast s hranicí a výplní',
    fillColor: '#E74C3C',
    fillOpacity: 0.2,
    name: 'Obdélník - Staveniště',
    opacity: 1,
    type: EGeometryType.RECTANGLE,
    weight: 3,
  },

  // Příklad: Circle - kruh
  {
    center: 'N49 30.000 E014 18.000',
    color: '#50064a',
    description: 'Kruhová oblast se středem a poloměrem',
    fillColor: '#db34d3',
    fillOpacity: 0.25,
    name: 'Kruh - Oblast zájmu',
    opacity: 0.9,
    radius: 300,
    type: EGeometryType.CIRCLE,
    weight: 2,
  },

  // Příklad: Path - obecná cesta
  {
    color: '#9B59B6',
    coordinates: [
      [49.53, 14.5],
      [49.535, 14.505],
      [49.54, 14.515],
    ],
    description: 'Obecná cesta s vlastním stylem',
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
    name: 'Cesta 2',
    opacity: 0.7,
    type: EGeometryType.PATH,
    weight: 4,
  },

  // Druhý příklad: Polygon s menší průhledností
  {
    color: '#27AE60',
    coordinates: [
      [49.46, 14.35],
      [49.465, 14.36],
      [49.47, 14.355],
      [49.468, 14.34],
    ],
    description: 'Les s minimální průhledností',
    fillColor: '#27AE60',
    fillOpacity: 0.5,
    name: 'Polygon - Les',
    opacity: 1,
    type: EGeometryType.POLYGON,
    weight: 2,
  },

  // Druhý příklad: Circle s větším poloměrem
  {
    center: [49.48, 14.45],
    color: '#F39C12',
    description: 'Velká kruhová oblast',
    fillColor: '#F39C12',
    fillOpacity: 0.15,
    name: 'Velký kruh',
    opacity: 0.6,
    radius: 500,
    type: EGeometryType.CIRCLE,
    weight: 1,
  },
  {
    coordinate: [49.48, 14.45],
    description: 'Bod reprezentovaný klasickým pinem',
    name: 'Výchozí bod',
    type: EGeometryType.POINT,
  },
];

export default geometriesData;
