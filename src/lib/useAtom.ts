import { useCallback, useEffect, useState } from "react";
import { IAtom } from "./IAtom";

export function useAtomSetter<T>(source: IAtom<T>) {
  return useCallback((value: T) => source.set(value), [source]);
}

export function useAtomValue<T>(
  source: IAtom<T>
): T extends (...args: any[]) => any ? ReturnType<T> : T {
  const [state, setState] = useState<T>(source.get());

  useEffect(() => {
    const unSubscribe = source.subscribe(setState);
    return () => unSubscribe();
  }, [source]);

  return state as any;
}

export function useAtom<T>(source: IAtom<T>) {
  return [useAtomValue(source), useAtomSetter(source)] as const;
}
