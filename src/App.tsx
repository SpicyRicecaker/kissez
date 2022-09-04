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
  untrack,
} from "solid-js";
import {
  createMutable,
  modifyMutable,
  reconcile,
  unwrap,
} from "solid-js/store";

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

  const multipleSelected = createMutable([] as boolean[]);

  const [state, setState] = createSignal("/" as State);

  let contentDiv: HTMLDivElement;
  let prevAnchor: HTMLAnchorElement;
  let nextAnchor: HTMLAnchorElement;

  // for `/` pages by default, set the state
  // history.replaceState(
  //   { state: state(), selected: selected() as number },
  //   "",
  //   "/"
  // );

  // window.addEventListener("popstate", (e: PopStateEvent) => {
  //   setState(e.state.state);
  //   setSelected(e.state.selected);
  // });

  const navigate = (e: MouseEvent) => {
    setState("/");
    // navigate to custom `/read` url
    // history.pushState({ state: "/", selected: selected() }, "", "/");
    // e.preventDefault();
  };

  createEffect(() => {
    const _ = [state(), books[selected()]?.url];
    untrack(async () => {
      if (state() === "/read") {
        let res = await fetch(`/curl`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(unwrap(books[selected()])),
        });

        if (!res.ok) {
          return;
        }
        console.log(
          `successfully requested information from ${
            books[selected()].url
          } without error`
        );

        const DEBUG_started = new Date();

        const cDocument = new DOMParser().parseFromString(
          await res.text(),
          "text/html"
        );

        for (let i = 0; i < books[selected()].blacklist.length; i++) {
          switch (books[selected()].blacklist[i].type) {
            case "css": {
              cDocument
                .querySelector(books[selected()].blacklist[i].value)
                ?.remove();
              break;
            }
            case "innerHTML": {
              // xpath
              (
                cDocument.evaluate(
                  `//*[text()['${
                    books[selected()].blacklist[i].value
                  }' = normalize-space()]]`,
                  cDocument,
                  null,
                  // see https://developer.mozilla.org/en-US/docs/Web/XPath/Introduction_to_using_XPath_in_JavaScript
                  // any unordered node is like `find()`, it gets the first node
                  XPathResult.FIRST_ORDERED_NODE_TYPE,
                  null
                )?.singleNodeValue as HTMLElement | null
              )?.remove();
            }
            default: {
              break;
            }
          }
        }

        {
          const content = matchValue(books[selected()].content, cDocument);
          if (content.length !== 0) {
            contentDiv.innerHTML = content;
          } else {
            contentDiv.innerHTML = `could not locate query ${
              books[selected()].content.value
            } via ${books[selected()].content.type} on page ${
              books[selected()].url
            }`;
          }
        }

        // if there doesn't exist an href, simply hide the prev and next div
        {
          const href = matchValue(books[selected()].prev, cDocument);
          if (href.length !== 0) {
            prevAnchor.href = href;
            prevAnchor.style.display = "block";
          } else {
            prevAnchor.href = "";
            prevAnchor.style.display = "none";
          }
        }

        {
          const href = matchValue(books[selected()].next, cDocument);
          if (href.length !== 0) {
            nextAnchor.href = href;
            nextAnchor.style.display = "block";
          } else {
            nextAnchor.href = "";
            nextAnchor.style.display = "none";
          }
        }

        console.log(
          "parsing text took",
          DEBUG_started.getTime() - new Date().getTime(),
          "ms"
        );
      }
    });
  });

  return (
    <div id={styles.main} class={state() === "/" ? styles.root : ""}>
      <Switch fallback={<></>}>
        <Match when={state() === "/"}>
          <div>
            <button
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
            </button>
            <button
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
            </button>
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
                    // history.pushState(
                    //   { state: "/read", selected: selected() },
                    //   "",
                    //   "/read"
                    // );
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
                  <>
                    <SelectorEdit
                      ident={`blacklist-${i}`}
                      selector={books[selected()].blacklist[i]}
                    />
                    <button
                      onClick={() => books[selected()].blacklist.splice(i, 1)}
                    >
                      -
                    </button>
                  </>
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
          <a href="/" onClick={navigate}>
            &lt;
          </a>
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
  const res = doc.evaluate(
    `//*[text()['${value}' = normalize-space()]]`,
    doc,
    null,
    // see https://developer.mozilla.org/en-US/docs/Web/XPath/Introduction_to_using_XPath_in_JavaScript
    // any unordered node is like `find()`, it gets the first node
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );

  if (res.singleNodeValue) {
    let node: HTMLElement | null = res.singleNodeValue as HTMLElement;
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
      const el = doc.querySelector(inquisitor.value);
      if (el) {
        return el.innerHTML;
      } else {
        return "";
      }
    }
    default: {
      // unreachable
      return "";
    }
  }
}
