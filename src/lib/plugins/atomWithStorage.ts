import { IAtom } from "../IAtom";
import { atom } from "../atom";

export function atomWithLocalStorage<T>(
  key: string,
  payload: T | ((get: IAtom<never>["getAtom"]) => never)
) {
  const newAtom = atom(payload);

  const prevVal = JSON.parse(localStorage.getItem(key) || "null");

  if (prevVal) {
    newAtom.set(prevVal.data);
  }

  newAtom.subscribe((val) =>
    localStorage.setItem(key, JSON.stringify({ data: val }))
  );

  return newAtom;
}
