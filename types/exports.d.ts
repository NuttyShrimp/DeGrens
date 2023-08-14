declare interface ClientExports {
  <R extends keyof ClientExports, K extends keyof ClientExports[R] = keyof ClientExports[R]>(
    name: K,
    fn: ClientExports[R][K]
  ): void;
}

declare interface ServerExports {
  <R extends keyof ServerExports, K extends keyof ServerExports[R] = keyof ServerExports[R]>(
    name: K,
    fn: ServerExports[R][K]
  ): void;
}
