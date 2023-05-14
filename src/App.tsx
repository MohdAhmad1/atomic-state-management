import { atom, useAtom, useAtomValue } from "./lib";

const firstNameAtom = atom("");
const lastNameAtom = atom("");

const fullNameAtom = atom((get) => {
  return `${get(firstNameAtom)} ${get(lastNameAtom)}`;
});

function App() {
  return (
    <div>
      <h1> What is your name </h1>

      <br />

      <FirstNameComponent />
      <LastNameComponent />
      <FullNameComponent />
    </div>
  );
}

function FirstNameComponent() {
  const [state, setState] = useAtom(firstNameAtom);

  return (
    <div>
      <label htmlFor="firstName">
        First Name
        <input
          id="firstName"
          placeholder="firstName"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
      </label>

      <br />
      <br />
    </div>
  );
}

function LastNameComponent() {
  const [state, setState] = useAtom(lastNameAtom);

  return (
    <div>
      <label htmlFor="lastName">
        First Name
        <input
          id="lastName"
          placeholder="lastName"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
      </label>

      <br />
      <br />
    </div>
  );
}

function FullNameComponent() {
  const fullName = useAtomValue(fullNameAtom);

  return (
    <div>
      <h2>{fullName}</h2>
    </div>
  );
}

export default App;
