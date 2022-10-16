import { For, type Component, batch, type Setter } from 'solid-js'
import { createMutable, modifyMutable, reconcile } from 'solid-js/store'
import { useBooks } from './Providers/BooksProvider'
import { useSelected } from './Providers/SelectedProvider'
import { useState } from './Providers/StateProvider'

import styles from './App.module.scss'
import SvgMinus from './assets/minus.svg?component'
import SvgPlus from './assets/plus.svg?component'
import SvgBox from './assets/box.svg?component'
import SvgPen from './assets/pen.svg?component'
import SvgMoon from './assets/moon.svg?component'

const Shelf: Component<{ setDark: Setter<boolean> }> = (props) => {
  const multipleSelected = createMutable([] as boolean[])

  const setState = useState()[1]
  const books = useBooks()
  const [selected, setSelected] = useSelected()

  // createEffect(() => {
  //   console.log(selected());
  // });

  return (
    <>
      <div
        style={{
          display: 'flex',
          'flex-direction': 'row',
          gap: '1rem',
          'padding-bottom': '1rem'
        }}
      >
        <SvgMinus
          onClick={() => {
            if (selected() === -1) {
              return
            }
            if (multipleSelected.length !== 0) {
              modifyMutable(
                books,
                reconcile(books.filter((_, i) => !multipleSelected[i]))
              )

              batch(() => {
                while (multipleSelected.length !== 0) {
                  multipleSelected.pop()
                }
              })
            } else {
              books.splice(selected(), 1)
            }
            setSelected(-1)
          }}
          class={styles.svg}
        />
        <SvgMoon
          onClick={() => props.setDark((prev) => !prev)}
          class={styles.svg}
          style={{ width: '2.5rem' }}
        />
      </div>

      <div id={styles.add}>
        <SvgPlus
          class={styles.svg}
          onClick={() => {
            books.push({
              name: 'Example',
              url: 'http://localhost:8080/example.html',
              prev: {
                value: 'Previous:',
                type: 'innerText'
              },
              next: {
                value: 'Next:',
                type: 'innerText'
              },
              content: {
                value: '.content',
                type: 'css'
              },
              blacklist: []
            })
          }}
        >
          +
        </SvgPlus>
      </div>
      <div id={styles.books}>
        <For each={books}>
          {(book, i) => (
            <div
              onClick={(e: MouseEvent) => {
                if (e.ctrlKey || e.metaKey) {
                  if (multipleSelected[i()]) {
                    multipleSelected[i()] = false
                  } else {
                    multipleSelected[i()] = true
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
                  return
                }

                if (e.shiftKey) {
                  e.preventDefault()
                  if (selected() !== -1) {
                    // for every key from selected to and including current selection, revert its selected status
                    // buffer.active = true;
                    const min = Math.min(i(), selected())
                    const max = Math.max(i(), selected())
                    batch(() => {
                      while (multipleSelected.length !== 0) {
                        multipleSelected.pop()
                      }
                      // buffer absorbs multiple selected
                      for (let x = min; x <= max; x++) {
                        multipleSelected[x] = true
                      }
                    })
                  }
                  return
                }

                if (i() === selected()) {
                  // then set state to reading
                  setState('/read')
                  // navigate to custom `/read` url
                  // history.pushState(
                  //   { state: "/read", selected: selected() },
                  //   "",
                  //   "/read"
                  // );
                } else {
                  setSelected(i())
                  // flush all multiple selects and buffers
                  batch(() => {
                    while (multipleSelected.length !== 0) {
                      multipleSelected.pop()
                    }
                  })
                }
              }}
              class={`${
                selected() === i() || multipleSelected[i()]
                  ? styles.selected
                  : ''
              } ${styles.book}`}
            >
              <div class={styles['book-title']}>
                <SvgBox style={{ width: '16px' }} />
                <span>{book.name}</span>
                <span class={styles['book-url']}>{book.url}</span>
              </div>
              <div
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelected(i())
                  setState('/config')
                }}
                class={styles['book-edit']}
              >
                <SvgPen style={{ width: '16px' }} />
              </div>
            </div>
          )}
        </For>
      </div>
      <button
        onClick={() => {
          const handleFile = async () => {
            const file = input.files?.item(0)
            if (!file) {
              return
            }
            const tempBooks = JSON.parse(await file.text())
            modifyMutable(books, reconcile(tempBooks))

            input.removeEventListener('change', handleFile)
          }
          const input = document.createElement('input')

          input.addEventListener('change', handleFile)
          input.type = 'file'
          input.accept = 'application/json'
          input.click()
        }}
      >
        import
      </button>
      <button
        onClick={() => {
          const file = new File([JSON.stringify(books)], 'books.json', {
            type: 'application/json'
          })
          const url = URL.createObjectURL(file)

          const a = document.createElement('a')
          a.download = 'true'
          a.href = url
          a.click()
        }}
      >
        export
      </button>
    </>
  )
}

export default Shelf
