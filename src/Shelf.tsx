import {
  createEffect,
  For,
  type Component,
  untrack,
  batch,
  Show,
  Index,
} from "solid-js";
import {
  createMutable,
  modifyMutable,
  reconcile,
  unwrap,
} from "solid-js/store";
import { Book, Selector, State } from "./App";
import { useBooks } from "./Providers/BooksProvider";
import { useSelected } from "./Providers/SelectedProvider";
import { SelectorEdit } from "./Selector";
import { useState } from "./Providers/StateProvider";

import styles from "./App.module.scss";
import minus from "./assets/minus.svg";
import plus from "./assets/plus.svg";
import box from "./assets/box.svg";
import pen from "./assets/pen.svg";

const Shelf: Component = () => {
  const multipleSelected = createMutable([] as boolean[]);

  const [state, setState] = useState();
  const books = useBooks();
  const [selected, setSelected] = useSelected();

  createEffect(() => {
    console.log(selected());
  })

  return (
    <>
      <img
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
        src={minus}
        style="color: white; width: 2.5rem"
      ></img>
      <div class={styles.add}>
        <img
          style="color: white; width: 2.5rem"
          src={plus}
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
        </img>
      </div>
      <div id={styles.books}>
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
              <div class={styles["book-title"]}>
                <img src={box}></img>
                <span>{book.name}</span>
                <span class={styles["book-url"]}>{book.url}</span>
              </div>
              <div>
                <img src={pen}></img>
              </div>
            </div>
          )}
        </For>
      </div>
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
    </>
  );
};

export default Shelf;
