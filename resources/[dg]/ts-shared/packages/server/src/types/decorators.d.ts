declare namespace Decorators {
  interface Base<N = string, K = string> {
    name: N;
    // PropertyKey of decorator
    key: K;
  }
  interface Export<E extends Object, R extends keyof E, F extends keyof E[R] = keyof E[R]> extends Base<F, string> {
    async?: boolean;
  }

  interface Event extends Base {
    net: boolean;
    target?: string;
    dgx?: boolean;
  }
}
