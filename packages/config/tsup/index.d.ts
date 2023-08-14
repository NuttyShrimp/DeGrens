declare module '@dgx/tsup-config' {
  import { Options } from 'tsup';
  export const getOptions: (opts: Options) => Options[];
}
