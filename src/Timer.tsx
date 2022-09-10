import { Component, onCleanup, onMount } from 'solid-js'

const Timer: Component = () => {
  let timer: HTMLDivElement

  let w: any
  let start: undefined | number

  const update = (timestamp: number): void => {
    if (start === undefined) {
      start = timestamp
    }
    const elapsed = timestamp - start
    timer.innerText = elapsed.toString()

    w = window.requestAnimationFrame(update)
  }

  onMount(() => {
    w = window.requestAnimationFrame(update)
  })

  onCleanup(() => {
    window.cancelAnimationFrame(w)
    start = undefined
  })

  return (
    <div>
      time until load: <span ref={timer!} /> ms
    </div>
  )
}

export default Timer
