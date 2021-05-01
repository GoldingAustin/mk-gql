/* This is a @kibeo/mst-gql generated file, don't modify it manually */
/* eslint-disable */

import { QueryBuilder } from "@kibeo/mst-gql"
import { BookModelSelector, BookModelType, bookModelPrimitives } from "./BookModel"
import { MovieModelSelector, MovieModelType, movieModelPrimitives } from "./MovieModel"

export class SearchItemModelSelector extends QueryBuilder {
  movie(builder) { return this.__inlineFragment(`Movie`, MovieModelSelector, builder) }
  book(builder) { return this.__inlineFragment(`Book`, BookModelSelector, builder) }
}
export function selectFromSearchItem() {
  return new SearchItemModelSelector()
}

// provides all primitive fields of union member types combined together
export const searchItemModelPrimitives = selectFromSearchItem().movie(movieModelPrimitives).book(bookModelPrimitives)