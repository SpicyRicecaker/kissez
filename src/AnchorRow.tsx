import { Component, type Setter, Show } from "solid-js";
import styles from "./App.module.scss";
import { Book, State } from "./App";

export const AnchorRow: Component<{
  next: string | null;
  book: Book;
  setState: Setter<State>;
}> = (props) => {
  console.log(props.next, props.next == null);
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
      <Show when={props.prev}>
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
      <Show when={props.next}>
        <a
          onClick={(e) => {
            e.preventDefault();
            props.book.url = props.next!;
          }}
        >
          nextasef
        </a>
      </Show>
    </div>
  );
};
