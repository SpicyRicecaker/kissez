import {
  type Component,
  createEffect,
  createSignal,
  For,
  Index,
  Match,
  Show,
  Switch,
  batch,
  untrack,
  onMount,
  createContext,
  useContext,
  Signal,
} from "solid-js";
import {
  createMutable,
  modifyMutable,
  reconcile,
  unwrap,
} from "solid-js/store";
import { AnchorRow } from "./AnchorRow";

import styles from "./App.module.scss";
import Shelf from "./Shelf";
import Read from "./Read";
import { SelectorEdit } from "./Selector";
import { useSelected } from "./Providers/SelectedProvider";
import { useBooks } from "./Providers/BooksProvider";
import { useState } from "./Providers/StateProvider";

export interface Book {
  name: string;
  url: string;
  content: Selector;
  next: Selector;
  prev: Selector;
  blacklist: Selector[];
}

export interface Selector {
  value: string;
  type: "css" | "innerHTML";
}

export type State = "/" | "/read";

const App: Component = () => {
  // DEBUGDEBUGDEBUG
  onMount(() => {
    // console.log(selected(), state());
    // console.log(unwrap(books));
    // setSelected(1);
    // setState("/read");
  });

  const [state, setState] = useState();
  const books = useBooks();
  const [selected] = useSelected();

  return (
    <div id={styles.main} class={state() === "/" ? styles.root : ""}>
      <Switch>
        <Match when={state() === "/"}>
          <Shelf />
        </Match>
        <Match when={state() === "/read"}>
          <Read book={books[selected()]} />
        </Match>
      </Switch>
    </div>
  );
};

export default App;
