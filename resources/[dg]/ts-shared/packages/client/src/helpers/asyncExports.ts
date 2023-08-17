const lib: ClientExports = global.exports as unknown as ClientExports;

global.asyncExports = new Proxy(lib, {
  apply<R extends keyof ClientExports, F extends keyof ClientExports[R] = keyof ClientExports[R]>(
    _: any,
    __: any,
    args: [F, ClientExports[R][F]]
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
    lib(exportName, middlewareFunc as ClientExports[R][F]);
  },
});

export {};
