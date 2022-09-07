import { Component, type Setter, Show } from "solid-js";
import styles from "./App.module.scss";
import { Book, State } from "./App";

export const AnchorRow: Component<{
  next: string | undefined;
  prev: string | undefined;
  book: Book;
  setState: Setter<State>;
}> = (props) => {
  return (
    <div class={styles.anchorRow}>
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          props.setState("/");
        }}
      >
        &lt;
      </a>
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
  );
};
