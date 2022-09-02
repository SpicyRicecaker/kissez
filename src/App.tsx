import {
  Component,
  createEffect,
  createSignal,
  For,
  Index,
  Match,
  Show,
  Switch,
} from "solid-js";
import { createMutable } from "solid-js/store";

// import logo from "./logo.svg";
import styles from "./App.module.scss";

interface Book {
  name: string;
  url: string;
  content: Selector;
  next: Selector;
  prev: Selector;
}

interface Selector {
  value: string;
  type: "css" | "innerHTML";
}

type State = "/" | "/read";

const App: Component = () => {
  const books: Book[] = createMutable(
    JSON.parse(localStorage.getItem("books") || "[]") as Book[]
  );

  createEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  });

  const [selected, setSelected] = createSignal(-1);

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

      console.log("rerunning parsing of document", books[selected()].url);

      contentDiv.innerHTML = matchValue(books[selected()].content, cDocument);

      prevAnchor.href = matchValue(books[selected()].prev, cDocument);
      nextAnchor.href = matchValue(books[selected()].next, cDocument);
    }
  });

  return (
    <div id={styles.main}>
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
                });
                console.log("updated");
              }}
            >
              +
            </div>
            <div
              onClick={() => {
                if (selected() !== -1) {
                  books.splice(selected(), 1);
                  setSelected(-1);
                }
              }}
            >
              -
            </div>
          </div>
          <For each={books}>
            {(book, i) => (
              <div
                onClick={() => {
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
                  }
                }}
                class={selected() === i() ? styles.selected : ""}
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
                  <div>
                    <label>
                      {p()} value
                      <input
                        onInput={(e: InputEvent) => {
                          (
                            books[selected()][p() as keyof Book] as Selector
                          ).value = (e.target as any).value;
                        }}
                        value={
                          (books[selected()][p() as keyof Book] as Selector)
                            .value
                        }
                      ></input>
                    </label>
                    <label>
                      css
                      <input
                        type="radio"
                        name={`${p()}-type`}
                        value="selector"
                        onClick={() =>
                          ((
                            books[selected()][p() as keyof Book] as Selector
                          ).type = "css")
                        }
                        checked={
                          (books[selected()][p() as keyof Book] as Selector)
                            .type === "css"
                        }
                      ></input>
                    </label>
                    <label>
                      innerHTML
                      <input
                        type="radio"
                        name={`${p()}-type`}
                        value="innerHTML"
                        onClick={() =>
                          ((
                            books[selected()][p() as keyof Book] as Selector
                          ).type = "innerHTML")
                        }
                        checked={
                          (books[selected()][p() as keyof Book] as Selector)
                            .type === "innerHTML"
                        }
                      ></input>
                    </label>
                  </div>
                )}
              </Index>
            </div>
          </Show>
        </Match>
        <Match when={state() === "/read"}>
          <a href="/" onClick={navigate}>
            &lt;
          </a>
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
