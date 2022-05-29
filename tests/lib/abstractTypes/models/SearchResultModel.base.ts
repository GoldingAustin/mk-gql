/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types, prop, tProp, Model, Ref, idProp } from "mobx-keystone"
import { QueryBuilder } from "mk-gql"


import { BookModel } from "./BookModel"
import { MovieModel } from "./MovieModel"
import { SearchItemModelSelector } from "./SearchItemModelSelector"


/**
 * SearchResultBase
 * auto generated base class for the model SearchResultModel.
 */
export class SearchResultModelBase extends Model({
    __typename: tProp("SearchResult"),
        inputQuery:prop<string>().withSetter(),
    items:prop<(MovieModel | BookModel | null)[]>(() => []).withSetter(),
  }) {
    
  }

export class SearchResultModelSelector extends QueryBuilder {
  get inputQuery() { return this.__attr(`inputQuery`) }
  items(builder?: string | SearchItemModelSelector | ((selector: SearchItemModelSelector) => SearchItemModelSelector)) { return this.__child(`items`, SearchItemModelSelector, builder) }
}
export function selectFromSearchResult() {
  return new SearchResultModelSelector()
}

export const searchResultModelPrimitives = selectFromSearchResult().inputQuery
