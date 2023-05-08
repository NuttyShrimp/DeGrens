declare global {
  interface CitizenExports {
    'dg-core': {
      getModule: <T extends keyof Core.ServerModules.List>(name: T) => Core.ServerModules.List[T];
    };
  }
}
