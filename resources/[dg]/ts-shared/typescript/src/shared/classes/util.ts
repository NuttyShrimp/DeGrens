import { Vector3 } from './vector3';

export class Util {
  private debouncingIds: Set<string> = new Set();

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

  getRndDecimal = (minimum: number, maximum: number): number => {
    return Math.random() * (maximum - minimum) + minimum;
  };

  round = (number: number, decimals: number) => {
    const multiplier = Math.pow(10, decimals);
    return Math.round(number * multiplier) / multiplier;
  };

  ArrayToVector3 = (array: number[]): Vector3 => {
    return new Vector3(array[0], array[1], array[2]);
  };

  Vector3ToArray = (vector: Vec3): ArrayVec3 => {
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

  awaitCondition = async (condition: () => boolean, timeout = 5000) => {
    let timedOut = false;
    setTimeout(() => {
      timedOut = true;
    }, timeout);
    while (!condition() && !timedOut) {
      await this.Delay(100);
    }
  };

  awaitEntityExistence = (entity: number, isNetId = false): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      let attempts = 0;
      const interval = setInterval(() => {
        const ent = isNetId ? NetworkGetEntityFromNetworkId(entity) : entity;
        attempts++;
        if (attempts > 50) {
          clearInterval(interval);
          resolve(false);
        }
        if (DoesEntityExist(ent)) {
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
    });
  };

  /**
   * @param id ID to check debouncing
   * @param timeout Timeout in ms
   * @returns returns wether id is not debouncing
   */
  debounce = (id: string, timeout: number) => {
    if (this.debouncingIds.has(id)) return false;
    this.debouncingIds.add(id);
    setTimeout(() => {
      this.debouncingIds.delete(id);
    }, timeout);
    return true;
  };

  /**
   * Only use for actual coords. For entities use:
   * - Server: Util functions
   * - Client: GetOffsetFromEntityInWorldCoords native (which is quicker)
   */
  getOffsetFromCoords = (position: Vec4, offset: Vec3): Vec3 => {
    const { w: angle, ...coords } = position;
    const offsetLength = Math.sqrt(Math.pow(offset.x, 2) + Math.pow(offset.y, 2));
    const offsetRadians = Math.atan2(offset.y, offset.x);
    const radians = offsetRadians + angle * (Math.PI / 180);

    return {
      x: coords.x + Math.cos(radians) * offsetLength,
      y: coords.y + Math.sin(radians) * offsetLength,
      z: coords.z + offset.z,
    };
  };
}
