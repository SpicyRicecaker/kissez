/* @refresh reload */
import { render } from 'solid-js/web'

import './index.css'
import App from './App'
import StateProvider from './Providers/StateProvider'
import BooksProvider from './Providers/BooksProvider'
import SelectedProvider from './Providers/SelectedProvider'

render(
  () => (
    <StateProvider>
      <BooksProvider>
        <SelectedProvider>
          <App />
        </SelectedProvider>
      </BooksProvider>
    </StateProvider>
  ),

  document.getElementById('root') as HTMLElement
)
