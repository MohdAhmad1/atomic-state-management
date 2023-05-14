export interface IAtom<T> {
  value: T;
  get: () => T;
  set: (value: T) => void;
  getAtom: <U>(p: IAtom<U>) => U;
  subscribe: (fn: (val: T) => void, initialId?: string) => () => void;
}
