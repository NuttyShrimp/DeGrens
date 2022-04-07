declare namespace Decorators {
  interface Base {
    name: string;
    // PropertyKey of decorator
    key: string;
  }
  interface Event extends Base {
    net: false;
    target?: string;
  }
}
