/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import StateProvider from "./StateProvider";
import BooksProvider from "./BooksProvider";
import SelectedProvider from "./SelectedProvider";

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

  document.getElementById("root") as HTMLElement
);
