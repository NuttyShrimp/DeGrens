import 'reflect-metadata';
import { lib } from '../exports';

export const ExportDecorators = <R extends keyof ClientExports = keyof ClientExports>() => ({
  /**
   * Register the function as a 5M export
   */
  Export: <F extends keyof ClientExports[R] = keyof ClientExports[R]>(exportName: F) => {
    return function (target: any, key: string) {
      if (!Reflect.hasMetadata('exports', target)) {
        Reflect.defineMetadata('exports', [], target);
      }

      const exports = Reflect.getMetadata('exports', target) as Array<Decorators.Export<ClientExports, R, F>>;

      exports.push({
        name: exportName,
        key,
      });
      Reflect.defineMetadata('exports', exports, target);
    };
  },
  AsyncExport: <F extends keyof ClientExports[R] = keyof ClientExports[R]>(exportName: F) => {
    return function (target: any, key: string) {
      if (!Reflect.hasMetadata('exports', target)) {
        Reflect.defineMetadata('exports', [], target);
      }

      const exports = Reflect.getMetadata('exports', target) as Array<Decorators.Export<ClientExports, R, F>>;

      exports.push({
        name: exportName,
        key,
        async: true,
      });
      Reflect.defineMetadata('exports', exports, target);
    };
  },

  /**
   * Export creator
   */
  ExportRegister: () => {
    return function <T extends { new (...args: any[]): any }>(constructor: T) {
      return class extends constructor {
        constructor(...args: any[]) {
          super(...args);

          if (!Reflect.hasMetadata('exports', this)) {
            Reflect.defineMetadata('exports', [], this);
          }

          const exports = Reflect.getMetadata('exports', this) as Array<Decorators.Export<ClientExports, R>>;
          exports.forEach(e => {
            const handler = (...exportArgs: any[]) => {
              return this[e.key](...exportArgs);
            };
            if (e.async) {
              // @ts-ignore
              asyncExports<R>(e.name, handler);
            }
            // @ts-ignore
            lib<R>(e.name, handler);
          });
        }
      };
    };
  },
});
