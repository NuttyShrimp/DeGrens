import { Vector3 } from './vector3';

export class Util {
  uuidv4 = () => {
    let uuid = '';
    for (let ii = 0; ii < 32; ii += 1) {
      switch (ii) {
        case 8:
        case 20:
          uuid += '-';
          uuid += ((Math.random() * 16) | 0).toString(16);
          break;
        case 12:
          uuid += '-';
          uuid += '4';
          break;
        case 16:
          uuid += '-';
          uuid += ((Math.random() * 4) | 8).toString(16);
          break;
        default:
          uuid += ((Math.random() * 16) | 0).toString(16);
      }
    }
    return uuid;
  };

  Delay = (ms: number): Promise<any> => new Promise(res => setTimeout(res, ms));

  getRndInteger = (minimum: number, maximum: number): number => {
    return Math.floor(Math.random() * (maximum - minimum)) + minimum;
  };

  ArrayToVector3 = (array: number[]): Vector3 => {
    return new Vector3(array[0], array[1], array[2]);
  };

  Vector3ToArray = (vector: Vector3): number[] => {
    return [vector.x, vector.y, vector.z];
  };
}
