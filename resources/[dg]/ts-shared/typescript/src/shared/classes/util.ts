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

  Vector3ToArray = (vector: Vec3): [number, number, number] => {
    return [vector.x, vector.y, vector.z];
  };

  Singleton = <T>() => {
    return class {
      private static instance: T;

      public static getInstance(): T {
        if (!this.instance) {
          this.instance = new this() as T;
        }
        return this.instance;
      }
    };
  };

  getEntityCoords(_: number) {
    return new Vector3(0, 0, 0);
  }

  getDistanceBetweenEntities(entity1: number, entity2: number) {
    const entity1Coords = this.getEntityCoords(entity1);
    const entity2Coords = this.getEntityCoords(entity2);
    return entity1Coords.subtract(entity2Coords).Length;
  }

  generateRndChar = (length: number, caseSensitive = true): string => {
    let result = '';
    const characters = `${caseSensitive ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : ''}abcdefghijklmnopqrstuvwxyz0123456789`;
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  isDevEnv() {
    return GetConvar('is_production', 'true') === 'false';
  }

  awaitCondition = async (condition: () => boolean, timeout = 5000) => {
    let timedOut = false;
    setTimeout(() => {
      timedOut = true;
    }, timeout);
    while (!condition() && !timedOut) {
      await this.Delay(100);
    }
  };
}
