const cfxExports = global.exports;

global.asyncExports = new Proxy(() => {}, {
  apply(t, self, args) {
    if (args.length !== 2) {
      throw new Error('this needs 2 arguments');
    }

    const [exportName, func] = args;
    const middlewareFunc = async (...args) => {
      await new Promise(res => setImmediate(res));
      return func(...args);
    };
    cfxExports(exportName, middlewareFunc);
  },
});