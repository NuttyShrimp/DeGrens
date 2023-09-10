type ObjEntries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

type ObjKeys<T> = (keyof T)[];

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
