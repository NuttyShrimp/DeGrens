// @ts-ignore
import colorNameList from 'color-name-list/dist/colornames.json';
import nearestColor from 'nearest-color';

// nearestColor need objects {name => hex} as input
let colors: Record<string, string> | undefined = undefined;

export const getNearestColorFromHex: (color: RGB | `#${string}`) => { name: string } = (color: RGB | `#${string}`) => {
  if (!colors) {
    colors = colorNameList.reduce(
      (o: Record<string, string>, { name, hex }: { name: string; hex: string }) => Object.assign(o, { [name]: hex }),
      {}
    );
  }
  return nearestColor.from(colors)(color);
};
