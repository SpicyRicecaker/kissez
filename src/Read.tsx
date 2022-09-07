import { Component, onMount } from "solid-js";
import { createMutable } from "solid-js/store";
import { AnchorRow } from "./AnchorRow";
import { Book, Selector } from "./App";
import styles from "./App.module.scss";

const Read: Component<{ book: Book }> = (props) => {
  let contentDiv: HTMLDivElement;

  const customHref: { prev: string | undefined; next: string | undefined } =
    createMutable({
      prev: "",
      next: "",
    });

  //   createEffect(() => {
  //     const _ = [state(), books[selected()]?.url];
  //     untrack(async () => {
  //     });
  //   });
  (async () => {
    const res = await fetch(`/curl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(props.book),
    });

    if (!res.ok) {
      return;
    }

    console.log(
      `successfully requested information from ${props.book.url} without error`
    );

    const DEBUG_started = new Date();

    const cDocument = new DOMParser().parseFromString(
      await res.text(),
      "text/html"
    );

    for (let i = 0; i < props.book.blacklist.length; i++) {
      switch (props.book.blacklist[i].type) {
        case "css": {
          cDocument
            .querySelector(props.book.blacklist[i].value)
            ?.remove();
          break;
        }
        case "innerHTML": {
          // xpath
          (
            cDocument.evaluate(
              `//*[text()['${
                props.book.blacklist[i].value
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
      const content = matchValue(props.book.content, cDocument);
      if (content !== undefined) {
        contentDiv!.innerHTML = content;
      } else {
        contentDiv!.innerHTML = `could not locate query ${
          props.book.content.value
        } via ${props.book.content.type} on page ${
          props.book.url
        }`;
      }
    }

    // if there doesn't exist an href, simply hide the prev and next div
    customHref.prev = matchValue(props.book.prev, cDocument);
    customHref.next = matchValue(props.book.next, cDocument);

    console.log(
      "parsing text took",
      DEBUG_started.getTime() - new Date().getTime(),
      "ms"
    );
  })();

  return (
    <>
      <AnchorRow
        next={customHref.next}
        prev={customHref.prev}
        book={props.book}
      />
      <div class={styles.book} ref={contentDiv!}></div>
      <AnchorRow
        next={customHref.next}
        prev={customHref.prev}
        book={props.book}
      />
    </>
  );
};

export default Read;

const findInnerText = (value: string, doc: Document): string | undefined =>
  // Search all nodes for text that contains value
  (
    doc.evaluate(
      `//a[@href and .//*[contains(text(), "${value}")] or contains(text(), "${value}")]`,
      doc,
      null,
      // see https://developer.mozilla.org/en-US/docs/Web/XPath/Introduction_to_using_XPath_in_JavaScript
      // `FIRST_ORDERED_NODE_TYPE` node is like `find()`, it gets the first node
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as HTMLAnchorElement | undefined
  )?.href;

function matchValue(inquisitor: Selector, doc: Document): string | undefined {
  // first match selector
  switch (inquisitor.type) {
    case "innerHTML": {
      return findInnerText(inquisitor.value, doc);
    }
    case "css": {
      return doc.querySelector(inquisitor.value)?.innerHTML;
    }
    default: {
      // unreachable
      return undefined;
    }
  }
}