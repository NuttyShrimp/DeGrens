// @ts-ignore
import { colorNameList } from 'color-name-list';
import nearestColor from 'nearest-color';

// nearestColor need objects {name => hex} as input
const colors = colorNameList.reduce(
  (o: Record<string, string>, { name, hex }: { name: string; hex: string }) => Object.assign(o, { [name]: hex }),
  {}
);

export const getNearestColorFromHex: (color: { r: number; g: number; b: number } | `#${string}`) => { name: string } =
  nearestColor.from(colors);
