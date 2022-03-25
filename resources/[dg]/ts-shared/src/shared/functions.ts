import { Vector3 } from 'fivem-js';

export const Delay = (ms: number): Promise<any> => new Promise(res => setTimeout(res, ms));

export const getRndInteger = (minimum: number, maximum: number): number => {
  return Math.floor(Math.random() * (maximum - minimum)) + minimum;
};

export const ArrayToVector3 = (array: number[]): Vector3 => {
  return new Vector3(array[0], array[1], array[2]);
};

export const Vector3ToArray = (vector: Vector3): number[] => {
  return [vector.x, vector.y, vector.z];
};
