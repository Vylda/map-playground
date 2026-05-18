# Map Playground

Jednoduchá TypeScript/Vite aplikace pro vykreslování geometrií do mapy přes Leaflet.
Aktivní data mapy se zapisují do lokálního souboru `data.ts`, který se neukládá do gitu.
Soubor `examples.ts` slouží jako zásobník hotových ukázek všech podporovaných typů geometrií
a jako výchozí šablona pro vytvoření vlastního `data.ts`.

## Instalace

```bash
npm install
```

## První spuštění

Po stažení projektu nejdřív vytvoř lokální `data.ts`. Projekt předpokládá, že `data.ts`
není v gitu, protože může obsahovat konkrétní pracovní data.

Nejrychlejší start je zkopírovat ukázková data:

```bash
cp examples.ts data.ts
```

Potom spusť vývojový server:

```bash
npm run dev
```

## Spuštění pro vývoj

Před spuštěním musí existovat lokální soubor `data.ts`. Pokud ho ještě nemáš, vytvoř ho
z `examples.ts`:

```bash
cp examples.ts data.ts
```

```bash
npm run dev
```

Vite vypíše lokální adresu aplikace, typicky `http://localhost:5173`.
Při vývoji upravuj hlavně `data.ts`; po uložení se aplikace automaticky obnoví.

## Kontrola kódu a testy

```bash
npm run lint
```

Tento příkaz spustí ESLint, TypeScript kontrolu a testy parseru souřadnic.

Samostatné testy lze pustit přes:

```bash
npm run test
```

## Produkční verze

```bash
npm run build
```

Produkční build se vytvoří do složky `dist`.
Lokální náhled produkční verze:

```bash
npm run preview
```

## Kam zapisovat geometrii

Aplikace načítá geometrii z lokálního souboru `data.ts`. Tento soubor je v `.gitignore`,
takže se necommitují tvoje konkrétní mapová data:

```ts
const geometriesData: Array<TGeometryData> = [
  {
    coordinate: center,
    name: 'Výchozí bod',
    type: EGeometryType.POINT,
  },
];
```

Každá položka v poli musí mít `type` z `EGeometryType` a vlastnosti podle daného typu.
Společné volitelné vlastnosti jsou hlavně `name` a `description`. Hodnota `name` se zobrazí
jako tooltip v mapě.

Souřadnice lze zapisovat jako pole `[lat, lon]` nebo jako text. Podrobněji viz část
`Formáty souřadnic`.

## Formáty souřadnic

Jedna souřadnice má typ `TCoords`, tedy buď číselné pole, nebo text:

```ts
type TCoords = [lat: number, lon: number] | string;
```

Vlastnosti `coordinate` a `center` přijímají jednu hodnotu `TCoords`.
Vlastnosti `coordinates` a `bounds` přijímají pole hodnot `TCoords`, takže lze v jednom
poli míchat číselný i textový zápis.

Podporované zápisy:

```ts
// Číselný zápis v desetinných stupních
[49.2138, 16.583966666666666]

// Textový zápis v desetinných stupních
'49.2138,16.583966666666666'

// Stupně a minuty bez světových stran
'49 12.828,16 35.038'

// Směrový zápis se světovými stranami
'N 49° 12.828 E 016° 35.038'

// Směrový zápis bez mezer
'N49°12.828E016°35.038'

// Směrový zápis bez znaku stupňů
'N49 12.828E016 35.038'

// Desetinná čárka a dvojtečka/apostrof jako oddělovač minut
'N49 12,828:E016 35,038:'

// Jižní a západní polokoule se převedou na záporná čísla
'S49°12.000 W016°30.000'
```

Pro více bodů se používá pole:

```ts
coordinates: [
  [49.5, 14.4],
  'N49 12.000 E016 35.000',
]
```

## Typy geometrií

### Point

Klasický pin v mapě.

```ts
{
  coordinate: [49.5, 14.4],
  description: 'Samostatný bod reprezentovaný pinem',
  name: 'Bod - Pin',
  type: EGeometryType.POINT,
}
```

Povinné vlastnosti:

- `coordinate`: souřadnice bodu
- `type: EGeometryType.POINT`

### Polyline

Otevřená čára složená z více bodů.

```ts
{
  coordinates: [
    [49.5, 14.4],
    [49.505, 14.41],
  ],
  type: EGeometryType.POLYLINE,
}
```

Povinné vlastnosti:

- `coordinates`: pole souřadnic
- `type: EGeometryType.POLYLINE`

Volitelné stylování:

- `color`
- `dashArray`
- `lineCap`
- `lineJoin`
- `opacity`
- `weight`

### Polygon

Uzavřená plocha s obrysem a výplní.

```ts
{
  coordinates: [
    [49.52, 14.45],
    [49.525, 14.46],
    [49.52, 14.465],
  ],
  fillColor: '#2ECC71',
  fillOpacity: 0.3,
  type: EGeometryType.POLYGON,
}
```

Povinné vlastnosti:

- `coordinates`: pole souřadnic vrcholů
- `type: EGeometryType.POLYGON`

Volitelné stylování:

- `color`
- `fillColor`
- `fillOpacity`
- `opacity`
- `weight`

### Rectangle

Obdélník určený dvěma rohovými body.

```ts
{
  bounds: [
    [49.48, 14.38],
    [49.49, 14.405],
  ],
  type: EGeometryType.RECTANGLE,
}
```

Povinné vlastnosti:

- `bounds`: dva protilehlé rohy obdélníku
- `type: EGeometryType.RECTANGLE`

Volitelné stylování:

- `color`
- `fillColor`
- `fillOpacity`
- `opacity`
- `weight`

### Circle

Kruh určený středem a poloměrem v metrech.

```ts
{
  center: 'N49 30.000 E014 18.000',
  radius: 300,
  type: EGeometryType.CIRCLE,
}
```

Povinné vlastnosti:

- `center`: souřadnice středu
- `radius`: poloměr v metrech
- `type: EGeometryType.CIRCLE`

Volitelné stylování:

- `color`
- `fillColor`
- `fillOpacity`
- `opacity`
- `weight`

### Path

Obecná cesta vykreslená jako Leaflet polyline. Hodí se pro pokročilejší případy,
kde chceš oddělit obecnou cestu od běžné `POLYLINE`.

```ts
{
  coordinates: [
    [49.53, 14.5],
    [49.535, 14.505],
  ],
  lineCap: 'round',
  lineJoin: 'round',
  type: EGeometryType.PATH,
}
```

Povinné vlastnosti:

- `coordinates`: pole souřadnic
- `type: EGeometryType.PATH`

Volitelné stylování:

- `color`
- `lineCap`
- `lineJoin`
- `opacity`
- `weight`

## Jak z `examples.ts` udělat `data.ts`

Protože `data.ts` není součástí gitu, po stažení projektu ho vytvoř z `examples.ts`:

```bash
cp examples.ts data.ts
```

Tím vznikne lokální pracovní kopie, kterou můžeš libovolně upravovat. Importy a exporty jsou
v obou souborech stejné, takže aplikace začne rovnou používat data z nově vytvořeného
`data.ts`.

Pokud už `data.ts` existuje a chceš ho přepsat aktuálními ukázkami:

```bash
cp examples.ts data.ts
```

Po této změně spusť:

```bash
npm run lint
npm run dev
```
