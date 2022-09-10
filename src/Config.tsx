import { Component, Index } from 'solid-js'
import { Book, Selector } from './App'
import { SelectorEdit } from './Selector'
import { useState } from './Providers/StateProvider'
import { useSelected } from './Providers/SelectedProvider'

import styles from './App.module.scss'

import SvgBack from './assets/back.svg?component'
import SvgMinus from './assets/minus.svg?component'
import SvgPlus from './assets/plus.svg?component'

const Config: Component<{ book: Book }> = (props) => {
  const setState = useState()[1]
  const setSelected = useSelected()[1]

  return (
    <>
      <SvgBack
        class={styles.svg}
        onClick={() => {
          setState('/')
          setSelected(-1)
        }}
      />
      <div id={styles.form}>
        <div class={styles['form-input']}>
          <input
            onInput={(e: InputEvent) =>
              (props.book.name = (e.target as any).value)
            }
            value={props.book.name}
          />
          <label>name</label>
        </div>
        <div class={styles['form-input']}>
          <input
            onInput={(e: InputEvent) =>
              (props.book.url = (e.target as any).value)
            }
            value={props.book.url}
          />
          <label>url</label>
        </div>
        <Index each={['prev', 'next', 'content']}>
          {(p) => (
            <>
              <div class={styles.label}>
                {((): string => {
                  switch (p()) {
                    case 'prev': {
                      return 'previous chapter button'
                    }
                    case 'next': {
                      return 'next chapter button'
                    }
                    case 'content': {
                      return 'content'
                    }
                    default: {
                      return ''
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
        <div class={styles.label}>blacklist elements</div>
        <Index each={props.book.blacklist}>
          {(_, i) => (
            <>
              <SelectorEdit
                ident={`blacklist-${i}`}
                selector={props.book.blacklist[i]}
              />
              <SvgMinus
                onClick={() => {
                  props.book.blacklist.splice(i, 1)
                }}
                class={styles.svg}
              />
            </>
          )}
        </Index>

        <SvgPlus
          style={{ margin: '0 auto' }}
          class={styles.svg}
          onClick={() =>
            props.book.blacklist.push({
              value: '',
              type: 'css'
            })
          }
        />
      </div>
    </>
  )
}

export default Config
