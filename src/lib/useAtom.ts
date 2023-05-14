import { useCallback, useEffect, useState } from "react";
import { IAtom } from "./IAtom";

export function useAtomSetter<T>(atom: IAtom<T>) {
  return useCallback((value: T) => atom.set(value), [atom]);
}

export function useAtomValue<T>(
  atom: IAtom<T>
): T extends (...args: any[]) => any ? ReturnType<T> : T {
  const [state, setState] = useState<T>(atom.get());

  useEffect(() => {
    const unSubscribe = atom.subscribe(setState);
    return () => unSubscribe();
  }, [atom]);

  return state as any;
}

export function useAtom<T>(atom: IAtom<T>) {
  return [useAtomValue(atom), useAtomSetter(atom)] as const;
}
