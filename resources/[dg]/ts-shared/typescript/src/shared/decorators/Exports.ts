import 'reflect-metadata';

/**
 * Register the function as a 5M export
 */
export const Export = (exportName: string) => {
  return function (target: any, key: string) {
    if (!Reflect.hasMetadata('exports', target)) {
      Reflect.defineMetadata('exports', [], target);
    }

    const exports = Reflect.getMetadata('exports', target) as Array<Decorators.Export>;

    exports.push({
      name: exportName,
      key,
    });
    Reflect.defineMetadata('exports', exports, target);
  };
};

export const AsyncExport = (exportName: string) => {
  return function (target: any, key: string) {
    if (!Reflect.hasMetadata('exports', target)) {
      Reflect.defineMetadata('exports', [], target);
    }

    const exports = Reflect.getMetadata('exports', target) as Array<Decorators.Export>;

    exports.push({
      name: exportName,
      key,
      async: true,
    });
    Reflect.defineMetadata('exports', exports, target);
  };
};

/**
 * Export creator
 */
export const ExportRegister = () => {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);

        if (!Reflect.hasMetadata('exports', this)) {
          Reflect.defineMetadata('exports', [], this);
        }

        const exports = Reflect.getMetadata('exports', this) as Array<Decorators.Export>;
        exports.forEach(e => {
          const handler = (...exportArgs: any[]) => {
            return this[e.key](...exportArgs);
          };
          if (e.async) {
            asyncExports(e.name, handler);
          }
          global.exports(e.name, handler);
        });
      }
    };
  };
};
