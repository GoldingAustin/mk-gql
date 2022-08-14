/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import { QueryBuilder } from "mk-gql"
import { BookModel, BookModelSelector, bookModelPrimitives } from "./BookModel"
import { MovieModel, MovieModelSelector, movieModelPrimitives } from "./MovieModel"

export type SearchItemUnion = MovieModel | BookModel

export class SearchItemModelSelector extends QueryBuilder {
  movie(builder?: string | MovieModelSelector | ((selector: MovieModelSelector) => MovieModelSelector)) { return this.__inlineFragment(`Movie`, MovieModelSelector, builder) }
  book(builder?: string | BookModelSelector | ((selector: BookModelSelector) => BookModelSelector)) { return this.__inlineFragment(`Book`, BookModelSelector, builder) }
}
export function selectFromSearchItem() {
  return new SearchItemModelSelector()
}

// provides all primitive fields of union member types combined together
export const searchItemModelPrimitives = selectFromSearchItem().movie(movieModelPrimitives).book(bookModelPrimitives)