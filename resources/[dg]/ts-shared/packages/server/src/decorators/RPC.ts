import 'reflect-metadata';

import { RPC } from '../classes';

/**
 * Register a Core callback
 */
export const RPCEvent = (RPCName: string) => {
  return function (target: any, key: string) {
    if (!Reflect.hasMetadata('RPCs', target)) {
      Reflect.defineMetadata('RPCs', [], target);
    }

    const RPCs = Reflect.getMetadata('RPCs', target) as Array<Decorators.Base>;

    RPCs.push({
      name: RPCName,
      key,
    });
    Reflect.defineMetadata('RPCs', RPCs, target);
  };
};

/**
 * Export creator
 */

export const RPCRegister = () => {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);

        if (!Reflect.hasMetadata('RPCs', this)) {
          Reflect.defineMetadata('RPCs', [], this);
        }

        const RPCs = Reflect.getMetadata('RPCs', this) as Array<Decorators.Base>;
        RPCs.forEach(e => {
          RPC.register(e.name, async (src, ...args: any[]) => {
            return this[e.key](src, ...args);
          });
        });
      }
    };
  };
};
