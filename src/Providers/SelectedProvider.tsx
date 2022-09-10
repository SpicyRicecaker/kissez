import {
  type Component,
  type JSXElement,
  type Signal,
  createContext,
  useContext,
  createSignal
} from 'solid-js'

const SelectedContext = createContext<Signal<number>>()

const SelectedProvider: Component<{ children: JSXElement }> = (props) => {
  // eslint-disable-next-line solid/reactivity
  const stateSignal = createSignal(1)

  return (
    <SelectedContext.Provider value={stateSignal}>
      {props.children}
    </SelectedContext.Provider>
  )
}
export default SelectedProvider

export const useSelected = (): Signal<number> => useContext(SelectedContext)!
