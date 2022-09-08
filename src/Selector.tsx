import { type Component } from "solid-js";
import type { Selector } from "./App";

import styles from "./App.module.scss";

export const SelectorEdit: Component<{
  ident: string;
  selector: Selector;
}> = (props) => {
  return (
    <>
      <div class={styles["form-input"]}>
        <input
          onInput={(e: InputEvent) => {
            props.selector.value = (e.target as any).value;
          }}
          id={props.ident}
          value={props.selector.value}
        ></input>
        <label for={props.ident}>query</label>
      </div>
      <div class={styles["form-radio"]}>
        <div class={styles["radio-label"]}>query type</div>
        <input
          type="radio"
          name={`${props.ident}-type`}
          id={`${props.ident}-css`}
          value="selector"
          onClick={() => (props.selector.type = "css")}
          checked={props.selector.type === "css"}
        ></input>
        <label for={`${props.ident}-css`}>css</label>
        <input
          type="radio"
          id={`${props.ident}-innerText`}
          name={`${props.ident}-type`}
          value="innerText"
          onClick={() => (props.selector.type = "innerText")}
          checked={props.selector.type === "innerText"}
        ></input>
        <label for={`${props.ident}-innerText`}>innerText</label>
      </div>
    </>
  );
};
