import { batch, Component, createEffect, createSignal, Show } from 'solid-js'
import { createMutable } from 'solid-js/store'
import { untrack } from 'solid-js/web'
import { AnchorRow } from './AnchorRow'
import { type Book, type Selector } from './App'
import styles from './App.module.scss'

import Timer from './Timer'

const Read: Component<{ book: Book }> = (props) => {
  let contentDiv: HTMLDivElement

  interface CustomHref {
    prev: string | undefined
    next: string | undefined
  }

  const customHref: CustomHref = createMutable({
    prev: undefined,
    next: undefined
  })

  const [ready, setReady] = createSignal(false)

  createEffect((): void => {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const _ = props.book.url
    void untrack(initBook)
  })

  const initBook = async (): Promise<void> => {
    setReady(false)
    const res = await fetch('/curl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(props.book)
    })

    if (!res.ok) {
      setReady(true)
      return
    }

    // console.log(
    //   `successfully requested information from ${props.book.url} without error`
    // );

    // const DEBUG_started = new Date();

    const cDocument = new DOMParser().parseFromString(
      await res.text(),
      'text/html'
    )

    // if there doesn't exist an href, simply hide the prev and next div
    batch(() => {
      customHref.prev = matchValue(props.book.prev, cDocument)
      customHref.next = matchValue(props.book.next, cDocument)
    })

    for (let i = 0; i < props.book.blacklist.length; i++) {
      switch (props.book.blacklist[i].type) {
        case 'css': {
          cDocument.querySelector(props.book.blacklist[i].value)?.remove()
          break
        }
        case 'innerText': {
          // xpath
          // eslint-disable-next-line no-extra-semi
          ;(
            cDocument.evaluate(
              `//*[text()['${props.book.blacklist[i].value}' = normalize-space()]]`,
              cDocument,
              null,
              // see https://developer.mozilla.org/en-US/docs/Web/XPath/Introduction_to_using_XPath_in_JavaScript
              // any unordered node is like `find()`, it gets the first node
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            )?.singleNodeValue as HTMLElement | null
          )?.remove()
          break
        }
        default: {
          break
        }
      }
    }

    const content = matchValue(props.book.content, cDocument)
    if (content !== undefined) {
      contentDiv!.innerHTML = content
    } else {
      contentDiv!.innerHTML = `could not locate query ${props.book.content.value} via ${props.book.content.type} on page ${props.book.url}`
    }

    // console.log(
    //   "parsing text took",
    //   DEBUG_started.getTime() - new Date().getTime(),
    //   "ms"
    // );

    setReady(true)
  }

  return (
    <>
      <Show when={ready()}>
        <AnchorRow
          next={customHref.next}
          prev={customHref.prev}
          book={props.book}
        />
      </Show>
      <div class={styles.content} ref={contentDiv!} />
      <Show when={ready()}>
        <AnchorRow
          next={customHref.next}
          prev={customHref.prev}
          book={props.book}
        />
      </Show>
      <Show when={!ready()}>
        <Timer />
      </Show>
    </>
  )
}

export default Read

const findInnerText = (value: string, doc: Document): string | undefined => {
  // Search all nodes for text that contains value
  return (
    doc.evaluate(
      `//a[@href and .//*[contains(text(), "${value}")] or contains(text(), "${value}")]`,
      doc,
      null,
      // see https://developer.mozilla.org/en-US/docs/Web/XPath/Introduction_to_using_XPath_in_JavaScript
      // `FIRST_ORDERED_NODE_TYPE` node is like `find()`, it gets the first node
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as HTMLAnchorElement | undefined
  )?.href
}

const matchValue = (
  inquisitor: Selector,
  doc: Document
): string | undefined => {
  // first match selector
  switch (inquisitor.type) {
    case 'innerText': {
      return findInnerText(inquisitor.value, doc)
    }
    case 'css': {
      return doc.querySelector(inquisitor.value)?.innerHTML
    }
    default: {
      // unreachable
      return undefined
    }
  }
}
