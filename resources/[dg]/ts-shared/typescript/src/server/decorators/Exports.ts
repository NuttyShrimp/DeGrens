import 'reflect-metadata';

/**
 * Register the function as a 5M export
 */
export const Export = (exportName: string) => {
  return function (target: unknown, key: string) {
    if (!Reflect.hasMetadata('exports', target)) {
      Reflect.defineMetadata('exports', [], target);
    }

    const exports = Reflect.getMetadata('exports', target) as Array<Decorators.Base>;

    exports.push({
      name: exportName,
      key,
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

        const exports = Reflect.getMetadata('exports', this) as Array<Decorators.Base>;
        exports.forEach(e => {
          global.exports(e.name, this[e.key]);
        });
      }
    };
  };
};
