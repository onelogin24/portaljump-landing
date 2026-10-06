export type Pin = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

// Real coordinates. Order matters: chips and arcs reference pins by index; avatar i comes from the asset manifest.
export const PINS: Pin[] = [
  { id: 'canada', name: 'Canada', lat: 55, lon: -110 },
  { id: 'gulf-of-mexico', name: 'the Gulf of Mexico', lat: 25, lon: -95 },
  { id: 'brazil', name: 'Brazil', lat: -8, lon: -60 },
  { id: 'eastern-europe', name: 'Eastern Europe', lat: 45, lon: 40 },
  { id: 'east-africa', name: 'East Africa', lat: 8, lon: 42 },
  { id: 'southern-africa', name: 'Southern Africa', lat: -22, lon: 26 },
  { id: 'northern-europe', name: 'Northern Europe', lat: 64, lon: 8 },
  { id: 'india', name: 'India', lat: 22, lon: 78 },
  { id: 'east-asia', name: 'East Asia', lat: 36, lon: 112 },
  { id: 'australia', name: 'Australia', lat: -27, lon: 134 },
  { id: 'southern-cone', name: 'the Southern Cone', lat: -36, lon: -66 },
  { id: 'west-africa', name: 'West Africa', lat: 8, lon: -3 },
];

export type IconName = 'plane' | 'camera' | 'food' | 'design' | 'movies' | 'music' | 'art' | 'laptop';

export type Chip = {
  label: string;
  icon: IconName;
  /** pin index its dotted line connects to */
  pin: number;
  /** centre of the chip, % of the hero (reference frame 1536x1024) */
  x: number;
  y: number;
  /** which side of the chip faces the globe (where the dot sits) */
  side: 'left' | 'right';
};

export const CHIPS: Chip[] = [
  { label: 'Travel', icon: 'plane', pin: 0, x: 28, y: 32, side: 'right' },
  { label: 'Photography', icon: 'camera', pin: 1, x: 21.5, y: 45.5, side: 'right' },
  { label: 'Food', icon: 'food', pin: 2, x: 21.6, y: 60, side: 'right' },
  { label: 'Design', icon: 'design', pin: 5, x: 25.6, y: 72, side: 'right' },
  { label: 'Movies', icon: 'movies', pin: 3, x: 75.7, y: 32, side: 'left' },
  { label: 'Music', icon: 'music', pin: 4, x: 83, y: 45.5, side: 'left' },
  { label: 'Art', icon: 'art', pin: 4, x: 82.7, y: 60, side: 'left' },
  { label: 'Technology', icon: 'laptop', pin: 5, x: 78, y: 74.6, side: 'left' },
];

/** Great-circle arcs across the globe surface, as pairs of pin indices. */
export const ARCS: [number, number][] = [
  [0, 3],
  [0, 2],
  [1, 3],
  [1, 5],
  [2, 5],
  [2, 4],
  [3, 4],
  // the wider network: every new pin joins at least two arcs
  [6, 3],
  [6, 0],
  [7, 4],
  [7, 8],
  [8, 3],
  [9, 8],
  [9, 7],
  [10, 2],
  [10, 5],
  [11, 2],
  [11, 3],
  [11, 5],
];

/** Arc indices that carry a slowly travelling glowing node. */
export const TRAVELERS = [0, 5, 14];

/** Two faint tilted orbit rings: radius (globe radii), tilt from the screen plane (deg), roll (deg). */
export const RINGS = [
  { r: 1.3, tilt: 66, roll: -20 },
  { r: 1.46, tilt: 72, roll: 14 },
];
