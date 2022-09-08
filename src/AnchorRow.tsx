import { Component, type Setter, Show, Accessor } from "solid-js";
import styles from "./App.module.scss";
import { Book, State } from "./App";
import { useState } from "./Providers/StateProvider";

import back from "./assets/back.svg";

export const AnchorRow: Component<{
  next: string | undefined;
  prev: string | undefined;
  book: Book;
}> = (props) => {
  const [_, setState] = useState();
  console.log("FROMT ANCHOR ROw", props.next, props.prev);
  return (
    <div class={styles.anchorRow}>
      <img
        onClick={() => {
          setState("/");
        }}
        src={back}
        id={styles.back}
      ></img>
      <div>
        <Show when={props.prev !== undefined}>
          <a
            href={props.prev!}
            onClick={(e) => {
              e.preventDefault();
              props.book.url = props.prev!;
            }}
          >
            prev
          </a>
        </Show>
        <Show when={props.next !== undefined}>
          <a
            onClick={(e) => {
              e.preventDefault();
              props.book.url = props.next!;
            }}
          >
            next
          </a>
        </Show>
      </div>
    </div>
  );
};
