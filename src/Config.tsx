import { Component, Index } from "solid-js";
import { Book, Selector } from "./App";
import { SelectorEdit } from "./Selector";
import { useState } from "./Providers/StateProvider";
import { useSelected } from "./Providers/SelectedProvider";

import styles from "./App.module.scss";

import back from "./assets/back.svg";

import minus from "./assets/minus.svg";
import plus from "./assets/plus.svg";

const Config: Component<{ book: Book }> = (props) => {
  const [_, setState] = useState();
  const [__, setSelected] = useSelected();

  return (
    <>
      <img
        onClick={() => {
          setState("/");
          setSelected(-1);
        }}
        src={back}
        id={styles.back}
      ></img>
      <div id={styles.form}>
        <div class={styles["form-input"]}>
          <input
            onInput={(e: InputEvent) =>
              (props.book.name = (e.target as any).value)
            }
            value={props.book.name}
          ></input>
          <label>name</label>
        </div>
        <div class={styles["form-input"]}>
          <input
            onInput={(e: InputEvent) =>
              (props.book.url = (e.target as any).value)
            }
            value={props.book.url}
          ></input>
          <label>url</label>
        </div>
        <Index each={["prev", "next", "content"]}>
          {(p) => (
            <>
              <div class={styles["label"]}>
                {((): string => {
                  switch (p()) {
                    case "prev": {
                      return "previous chapter button";
                    }
                    case "next": {
                      return "next chapter button";
                    }
                    case "content": {
                      return "content";
                    }
                    default: {
                      return "";
                    }
                  }
                })()}
              </div>
              <SelectorEdit
                ident={p()}
                selector={props.book[p() as keyof Book] as Selector}
              />
            </>
          )}
        </Index>
        <div class={styles["label"]}>blacklist elements</div>
        <Index each={props.book.blacklist}>
          {(_, i) => (
            <>
              <SelectorEdit
                ident={`blacklist-${i}`}
                selector={props.book.blacklist[i]}
              />
              <img
                onClick={() => {
                  props.book.blacklist.splice(i, 1);
                }}
                src={minus}
                style="color: white; width: 2.5rem"
              ></img>
            </>
          )}
        </Index>

        <img
          style="color: white; width: 2.5rem; margin: 0 auto;"
          src={plus}
          onClick={() =>
            props.book.blacklist.push({
              name: "some random name",
              value: "",
              type: "css",
            } as Selector)
          }
        ></img>
      </div>
    </>
  );
};

export default Config;
