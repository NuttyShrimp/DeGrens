import { DIRECTIONS, PATH_LENGTH } from './constants';

export const toLength = (perc: number) => {
  return (100 - perc) * (PATH_LENGTH / 100) * -1;
};

export const getRandomDirection = () => {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
};

export const generatePath = (startPercentage: number, endPercentage: number) => {
  const round = (n: number) => Math.round(n * 1000) / 1000;

  const rotation = -45 * (Math.PI / 180);
  const startRad = startPercentage * 0.9 * (Math.PI / 180);
  const endRad = endPercentage * 0.9 * (Math.PI / 180);
  const size = 50;

  // used to translate to center
  const center = {
    x: size * Math.sin(0),
    y: size * Math.cos(0) * -1,
  };
  const rotatedCenter = {
    x: center.x * Math.cos(rotation) - center.y * Math.sin(rotation),
    y: center.y * Math.cos(rotation) + center.x * Math.sin(rotation),
  };

  // Startposition calc
  const startPos = {
    x: size * Math.sin(startRad),
    y: size * Math.cos(startRad) * -1,
  };
  const rotatedStartPos = {
    x: startPos.x * Math.cos(rotation) - startPos.y * Math.sin(rotation),
    y: startPos.y * Math.cos(rotation) + startPos.x * Math.sin(rotation),
  };
  const translatedStartPos = {
    x: rotatedStartPos.x - rotatedCenter.x,
    y: rotatedStartPos.y - rotatedCenter.y,
  };

  // Endposition calc
  const endPos = {
    x: size * Math.sin(endRad),
    y: size * Math.cos(endRad) * -1,
  };
  const rotatedEndPos = {
    x: endPos.x * Math.cos(rotation) - endPos.y * Math.sin(rotation),
    y: endPos.y * Math.cos(rotation) + endPos.x * Math.sin(rotation),
  };
  const translatedEndPos = {
    x: rotatedEndPos.x - rotatedCenter.x,
    y: rotatedEndPos.y - rotatedCenter.y,
  };

  // To fix in viewbox
  const offset = {
    x: 10,
    y: 20,
  };

  return `M ${round(translatedEndPos.x) + offset.x} ${round(translatedEndPos.y) + offset.y} A 50 50 0 0 0 ${
    round(translatedStartPos.x) + offset.x
  } ${round(translatedStartPos.y) + offset.y}`;
};
