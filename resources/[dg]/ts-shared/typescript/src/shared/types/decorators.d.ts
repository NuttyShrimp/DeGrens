declare namespace Decorators {
  interface Base {
    name: string;
    // PropertyKey of decorator
    key: string;
  }
  interface Export extends Base {
    async?: boolean;
  }
}
