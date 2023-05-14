import type { IAtom } from "./IAtom";

let atomId = 0;

function atomFactory<T>(
  payload: T | ((get: IAtom<never>["getAtom"]) => never)
) {
  const atom: IAtom<T> = {} as any;

  const subscribers = new Map();

  let subscriberIds = 0;

  const key = atomId++;

  atom.getAtom = function (prevAtom) {
    prevAtom.subscribe(() => {
      if (payload instanceof Function) {
        atom.value = payload(atom.getAtom);
        notify(atom.value);
      }
    }, `atom_${key}`);

    return prevAtom.get();
  };

  atom.get = function () {
    return atom.value;
  };

  atom.set = function (value: T) {
    atom.value = value;
    notify(value);
  };

  function notify(value: T) {
    subscribers.forEach((subscriber) => {
      subscriber(value);
    });
  }

  atom.subscribe = function (fn, initialId) {
    const id = initialId ?? (subscriberIds += 1);

    subscribers.set(id, fn);

    return () => void subscribers.delete(id);
  };

  if (payload instanceof Function) {
    atom.value = payload(atom.getAtom);
  } else {
    atom.value = payload;
  }

  return atom;
}

export { atomFactory as atom };
