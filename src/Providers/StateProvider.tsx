import {
  type Component,
  type JSXElement,
  type Signal,
  createContext,
  useContext,
  createSignal
} from 'solid-js'
import { type State } from '../App'

const StateContext = createContext<Signal<State>>()

const StateProvider: Component<{ children: JSXElement }> = (props) => {
  // eslint-disable-next-line solid/reactivity
  const stateSignal = createSignal('/' as State)

  return (
    <StateContext.Provider value={stateSignal}>
      {props.children}
    </StateContext.Provider>
  )
}
export default StateProvider

export const useState = (): Signal<State> => useContext(StateContext)!
