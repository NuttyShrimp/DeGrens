const lib: ServerExports = global.exports as unknown as ServerExports;

global.asyncExports = new Proxy(lib, {
  apply<R extends keyof ServerExports, F extends keyof ServerExports[R] = keyof ServerExports[R]>(
    _: any,
    __: any,
    args: [F, ServerExports[R][F]]
  ) {
    if (args.length !== 2) {
      throw new Error('this needs 2 arguments');
    }

    const [exportName, func] = args;
    const middlewareFunc = async (...args: any[]) => {
      await new Promise(res => setImmediate(res));
      // @ts-ignore
      return func(...args);
    };
    lib(exportName, middlewareFunc as ServerExports[R][F]);
  },
});

export {};
