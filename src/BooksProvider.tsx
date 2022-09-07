import {
  type Component,
  type JSXElement,
  createEffect,
  createContext,
  useContext,
} from "solid-js";
import { createMutable } from "solid-js/store";
import { Book } from "./App";

const BooksContext = createContext<Book[]>();

const BooksProvider: Component<{ children: JSXElement }> = (props) => {
  const books: Book[] = createMutable(
    JSON.parse(localStorage.getItem("books") || "[]") as Book[]
  );
  createEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  });

  return (
    <BooksContext.Provider value={books}>{props.children}</BooksContext.Provider>
  );
};
export default BooksProvider;

export const useBooks = () => useContext(BooksContext)!;
