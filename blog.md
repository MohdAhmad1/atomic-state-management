# Atomic State Management in React.

## Where does the state live?

Well, it depends. React developers usually use two approaches to organize application state, component state (useState) and global store (Redux). Accordingly, the state can live in relation with component or in Redux store, to be short, it is tightly coupled with the originator and cannot be created independently.

It solidly limits the software designer to organize the software architecture with desired patterns.

Have you ever wanted to use useState hook, but pass a reference to your state object?

## Atoms

Atomic State Management implies using Atoms as a single source of the state. It’s like useState that can be shared between components. It took advantages from both component state and global store patterns into one approach. Atoms are specifically designed to store one value.

It’s short in writing and easy for sharing between components, as demonstrated in the example below.

```jsx
// example from jotai.org
const animeAtom = atom(animeAtom);

const Header = () => {
  const [anime, setAnime] = useAtom(animeAtom)
  ...
}

```

As you can see in above example Atomic State Management model reduces boilerplate code compared to aproaches like [flux pattern](https://www.freecodecamp.org/news/an-introduction-to-the-flux-architectural-pattern-674ea74775c9/) and is very similar to React's useState hook.

> TL;DR Use atomic state management techniques to achieve better flexibility in organizing application state management.

## Build your own from scratch.

Before we proceed you can check project on [github](https://github.com/MohdAhmad1/atom)

### Atom Creators / Factory implementation

```ts
let atomId = 0;

export function atom(payload) {
  const atom = {};

  const subscribers = new Map();

  let subscriberIds = 0;

  const key = atomId++;

  // this function returns current value
  atom.get = function () {
    return atom.value;
  };

  // sets value and noify to subscribers
  atom.set = function (value) {
    atom.value = value;
    notify(value);
  };

  // notifier function to notify value
  function notify(value) {
    subscribers.forEach((subscriber) => {
      subscriber(value);
    });
  }

  // subscribe to changes; returns unsubscribe fn
  atom.subscribe = function (fn, initialId) {
    const id = initialId ?? (subscriberIds += 1);

    subscribers.set(id, fn);

    return () => void subscribers.delete(id);
  };

  // actual atom value
  atom.value = payload;

  return atom;
}
```

It is a very basic implementation of atom factory it returns an atom object.

```ts
// atom returned by factory fn

{
    get: () => void
    set: (value: any) => void
    subscribe: () => (() => void)
}

```

### useAtom hook implementation

```js
export function useAtom(atom) {
  const [state, setState] = useState(atom.get());

  useEffect(() => {
    // subscribe on mount and sets local state with new value (used for sync atom to reacts state)
    const unSubscribe = atom.subscribe(setState);

    // unsubscribe on unmount
    return () => unSubscribe();
  }, [atom]);

  // just setter function.
  const setAtomValue = useCallback((value) => source.set(value), [source]);

  return [state, setAtomValue];
}
```

uhhmmm.... its good but we need a little bit refactoring, we need useAtomValue / useAtomSetter hooks like [Jotai](https://www.jotai.org) to optimize rerenders.

### useAtomValue and useAtomSetter Implementation

Here we are breaking useAtom hooks in two parts.

```js
// useAtomValue
export function useAtomValue(source) {
  const [state, setState] = useState(source.get());

  useEffect(() => {
    const unSubscribe = source.subscribe(setState);
    return () => unSubscribe();
  }, [source]);

  return state;
}

// useAtomSetter
export function useAtomSetter(source) {
  return useCallback((value) => source.set(value), [source]);
}
```

Refactored useAtom Hook

```js
export function useAtom(source) {
  return [useAtomValue(source), useAtomSetter(source)];
}
```

### Usage

Its same as Jotai

```jsx
// example from jotai.org
const animeAtom = atom('bleach');

const Header = () => {
  const [anime, setAnime] = useAtom(animeAtom)
  ...
}

```

## Derived Atom Amplementation.

```js
// refactored atom factory fn
export function atom(payload) {
  const atom = {};

  const subscribers = new Map();

  let subscriberIds = 0;

  const key = atomId++;

  // getAtom function used to subscribe to another atom (for derived state)
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

  atom.set = function (value) {
    atom.value = value;
    notify(value);
  };

  function notify(value) {
    subscribers.forEach((subscriber) => {
      subscriber(value);
    });
  }

  atom.subscribe = function (fn, initialId) {
    const id = initialId ?? (subscriberIds += 1);

    subscribers.set(id, fn);

    return () => void subscribers.delete(id);
  };

  // check if payload is a function (derived atom) or normal atom
  if (payload instanceof Function) {
    atom.value = payload(atom.getAtom);
  } else {
    atom.value = payload;
  }

  return atom;
}
```

useAtom will remain same 😊.

### Derived atom example

```js
import { atom, useAtom, useAtomValue } from './lib';

const priceAtom = createAtom(15);

const discountAtom = createAtom(10);

const discountedPriceAtom = createAtom((get) => {
    return (get(priceAtom) / 100) * get(discountAtom);
});

const Component = () => {
  const [price, setPrice] = useAtom(priceAtom);

  const discountedPrice = useAtomValue(discountedPriceAtom);
  ...
}
```

## BONUS: atomWithLocalStorage Plugin

```js
import { atom } from "./lib";

export function atomWithLocalStorage(key, payload) {
  // create new atom
  const newAtom = atom(payload);

  // check value exists in localstorage or not
  const prevVal = JSON.parse(localStorage.getItem(key) || "null");

  if (prevVal) {
    // if value exists in localstorage sets to atom
    newAtom.set(prevVal.data);
  }

  // subscribe to changes and set value in localstorage
  newAtom.subscribe((val) =>
    localStorage.setItem(key, JSON.stringify({ data: val }))
  );

  return newAtom;
}
```
