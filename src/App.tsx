import {
  Component,
  createEffect,
  createSignal,
  For,
  Index,
  Match,
  Show,
  Switch,
  batch,
} from "solid-js";
import {
  createMutable,
  modifyMutable,
  reconcile,
} from "solid-js/store";

// import logo from "./logo.svg";
import styles from "./App.module.scss";
import { SelectorEdit } from "./Selector";

interface Book {
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

type State = "/" | "/read";

enum EditingMode {
  Regular,
  Multiple,
}

const App: Component = () => {
  const books: Book[] = createMutable(
    JSON.parse(localStorage.getItem("books") || "[]") as Book[]
  );

  createEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  });

  const [selected, setSelected] = createSignal(-1);

  const [editingMode, setEditingMode] = createSignal(EditingMode.Regular);

  const multipleSelected = createMutable([] as boolean[]);

  const [state, setState] = createSignal("/" as State);

  let contentDiv: HTMLDivElement;
  let prevAnchor: HTMLAnchorElement;
  let nextAnchor: HTMLAnchorElement;

  // const [editMode, setEditMode] = createSignal(false);

  // for `/` pages by default, set the state
  history.replaceState(
    { state: state(), selected: selected() as number },
    "",
    "/"
  );

  window.addEventListener("popstate", (e: PopStateEvent) => {
    setState(e.state.state);
    setSelected(e.state.selected);
  });

  const navigate = (e: MouseEvent) => {
    setState("/");
    // navigate to custom `/read` url
    history.pushState({ state: "/", selected: selected() }, "", "/");
    e.preventDefault();
  };

  createEffect(async () => {
    if (state() === "/read" && contentDiv) {
      // let res = await fetch(`/asdf.html`);
      let res = await fetch(`/curl?url=${books[selected()].url}`);
      if (!res.ok) {
        return;
      }

      const cDocument = new DOMParser().parseFromString(
        await res.text(),
        "text/html"
      );

      // createEffect(() => {
      //   console.log(multipleSelected[7]);
      //   console.log(buffer.active);
      //   console.log(buffer.max);
      //   console.log(buffer.min);
      // });

      console.log("rerunning parsing of document", books[selected()].url);

      contentDiv.innerHTML = matchValue(books[selected()].content, cDocument);

      prevAnchor.href = matchValue(books[selected()].prev, cDocument);
      nextAnchor.href = matchValue(books[selected()].next, cDocument);
    }
  });

  return (
    <div id={styles.main} class={state() === "/" ? styles.root : ""}>
      <Switch fallback={<></>}>
        <Match when={state() === "/"}>
          <div>
            <div
              onClick={() => {
                books.push({
                  name: "[book name]",
                  url: "",
                  content: {
                    value: "",
                    type: "css",
                  },
                  next: {
                    value: "",
                    type: "innerHTML",
                  },
                  prev: {
                    value: "",
                    type: "innerHTML",
                  },
                  blacklist: [],
                });
              }}
            >
              +
            </div>
            <div
              onClick={() => {
                if (selected() === -1) {
                  return;
                }
                if (multipleSelected.length !== 0) {
                  modifyMutable(
                    books,
                    reconcile(books.filter((_, i) => !multipleSelected[i]))
                  );

                  batch(() => {
                    while (multipleSelected.length !== 0) {
                      multipleSelected.pop();
                    }
                  });
                } else {
                  books.splice(selected(), 1);
                }
                setSelected(-1);
              }}
            >
              -
            </div>
          </div>
          <For each={books}>
            {(book, i) => (
              <div
                onClick={(e: MouseEvent) => {
                  if (e.ctrlKey || e.metaKey) {
                    if (multipleSelected[i()] === true) {
                      multipleSelected[i()] = false;
                    } else {
                      multipleSelected[i()] = true;
                    }
                    // console.log(multipleSelected[i()]);
                    // console.log(
                    //   (multipleSelected[i()] === true) !==
                    //     (buffer.active &&
                    //       buffer.min <= i() &&
                    //       i() <= buffer.max)
                    // );
                    // console.log(multipleSelected[i()] === true);
                    // console.log(
                    //   buffer.active && buffer.min <= i() && i() <= buffer.max
                    // );
                    // if and only if the pivot exists in the range of existing
                    // buffers, set that to the new pivot, then flush the
                    // current buffer
                    return;
                  }

                  if (e.shiftKey) {
                    e.preventDefault();
                    if (selected() !== -1) {
                      // for every key from selected to and including current selection, revert its selected status
                      // buffer.active = true;
                      const min = Math.min(i(), selected());
                      const max = Math.max(i(), selected());
                      batch(() => {
                        while (multipleSelected.length !== 0) {
                          multipleSelected.pop();
                        }
                        // buffer absorbs multiple selected
                        for (let x = min; x <= max; x++) {
                          multipleSelected[x] = true;
                        }
                      });
                    }
                    return;
                  }

                  if (i() === selected()) {
                    // then set state to reading
                    setState("/read");
                    // navigate to custom `/read` url
                    history.pushState(
                      { state: "/read", selected: selected() },
                      "",
                      "/read"
                    );
                  } else {
                    setSelected(i());
                    // flush all multiple selects and buffers
                    batch(() => {
                      while (multipleSelected.length !== 0) {
                        multipleSelected.pop();
                      }
                    });
                  }
                }}
                class={`${
                  selected() === i() || multipleSelected[i()] === true
                    ? styles.selected
                    : ""
                } ${styles.book}`}
              >
                {book.name}
              </div>
            )}
          </For>
          <Show when={selected() !== -1}>
            <div>
              <label>
                name
                <input
                  onInput={(e: InputEvent) =>
                    (books[selected()].name = (e.target as any).value)
                  }
                  value={books[selected()].name}
                ></input>
              </label>
              <label>
                url
                <input
                  onInput={(e: InputEvent) =>
                    (books[selected()].url = (e.target as any).value)
                  }
                  value={books[selected()].url}
                ></input>
              </label>
              <Index each={["prev", "next", "content"]}>
                {(p) => (
                  <SelectorEdit
                    ident={p()}
                    selector={books[selected()][p() as keyof Book] as Selector}
                  />
                )}
              </Index>
              <Index each={books[selected()].blacklist}>
                {(_, i) => (
                  <SelectorEdit
                    ident={`blacklist-${i}`}
                    selector={books[selected()].blacklist[i]}
                  />
                )}
              </Index>
              <button
                onClick={() =>
                  books[selected()].blacklist.push({
                    value: "",
                    type: "css",
                  } as Selector)
                }
              >
                +
              </button>
            </div>
          </Show>
        </Match>
        <Match when={state() === "/read"}>
          <div class={styles.anchorRow}>
            <a href="/" onClick={navigate}>
              &lt;
            </a>
            <a
              ref={prevAnchor!}
              onClick={(e) => {
                e.preventDefault();
                // console.log((e.target as any).href, books[selected()].url);
                books[selected()].url = prevAnchor.href;
              }}
            >
              prev
            </a>
            <a
              ref={nextAnchor!}
              onClick={(e) => {
                e.preventDefault();
                books[selected()].url = nextAnchor.href;
              }}
            >
              next
            </a>
          </div>
          <div class={styles.content} ref={contentDiv!}></div>
          <div class={styles.anchorRow}>
            <a
              ref={prevAnchor!}
              onClick={(e) => {
                e.preventDefault();
                // console.log((e.target as any).href, books[selected()].url);
                books[selected()].url = prevAnchor.href;
              }}
            >
              prev
            </a>
            <a
              ref={nextAnchor!}
              onClick={(e) => {
                e.preventDefault();
                books[selected()].url = nextAnchor.href;
              }}
            >
              next
            </a>
          </div>
        </Match>
      </Switch>
    </div>
  );
};

export default App;

function findInnerHTML(value: string, doc: Document): string {
  // Search all nodes for text that contains value
  const iterator = doc.evaluate(
    `//*[text()['${value}' = normalize-space()]]`,
    doc,
    null,
    XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
    null
  );
  const next = iterator.iterateNext() as HTMLElement;

  if (next) {
    let node: HTMLElement | null = next;
    do {
      if (node.hasAttribute("href")) {
        return (node as HTMLAnchorElement).href;
      }
      node = node.parentElement;
    } while (node != null);
  }
  return "";
}

function matchValue(inquisitor: Selector, doc: Document): string {
  // first match selector
  switch (inquisitor.type) {
    case "innerHTML": {
      return findInnerHTML(inquisitor.value, doc);
    }
    case "css": {
      return findSelector(inquisitor.value, doc);
    }
    default: {
      return "";
    }
  }
}

function findSelector(value: string, doc: Document): string {
  const el = doc.querySelector(value);
  if (el) {
    return el.innerHTML;
  } else {
    return "";
  }
}
