import 'reflect-metadata';

/**
 * Register a Core callback
 */
export const Callback = (callbackName: string) => {
  return function (target: unknown, key: string) {
    if (!Reflect.hasMetadata('callbacks', target)) {
      Reflect.defineMetadata('callbacks', [], target);
    }

    const callbacks = Reflect.getMetadata('callbacks', target) as Array<Decorators.Base>;

    callbacks.push({
      name: callbackName,
      key,
    });
    Reflect.defineMetadata('callbacks', callbacks, target);
  };
};

/**
 * Export creator
 */

export const CallbackRegister = () => {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);

        if (!Reflect.hasMetadata('callbacks', this)) {
          Reflect.defineMetadata('callbacks', [], this);
        }

        const callbacks = Reflect.getMetadata('callbacks', this) as Array<Decorators.Base>;
        callbacks.forEach(e => {
          DGCore.Functions.CreateCallback(e.name, async (src, cb, ...args: any[]) => {
            const result = await this[e.key](src, ...args);
            cb(result);
          });
        });
      }
    };
  };
};
