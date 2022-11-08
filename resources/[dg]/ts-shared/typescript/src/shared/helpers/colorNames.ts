// @ts-ignore
import nearestColor from 'nearest-color';
import colorNameList from 'color-name-list';

// nearestColor need objects {name => hex} as input
const colors = colorNameList.reduce( ( o, { name, hex } ) => Object.assign( o, { [name]: hex } ), {} );

export const getNearestColorFromHex = nearestColor.from( colors );