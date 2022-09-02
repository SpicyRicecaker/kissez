import { Component, splitProps } from "solid-js";
import type { Selector } from "./App";

export const SelectorEdit: Component<{ ident: string; selector: Selector }> = (
  props
) => {
  return (
    <div>
      <label>
        {props.ident} value
        <input
          onInput={(e: InputEvent) => {
            props.selector.value = (e.target as any).value;
          }}
          value={props.selector.value}
        ></input>
      </label>
      <label>
        css
        <input
          type="radio"
          name={`${props.ident}-type`}
          value="selector"
          onClick={() => (props.selector.type = "css")}
          checked={props.selector.type === "css"}
        ></input>
      </label>
      <label>
        innerHTML
        <input
          type="radio"
          name={`${props.ident}-type`}
          value="innerHTML"
          onClick={() => (props.selector.type = "innerHTML")}
          checked={props.selector.type === "innerHTML"}
        ></input>
      </label>
    </div>
  );
};
