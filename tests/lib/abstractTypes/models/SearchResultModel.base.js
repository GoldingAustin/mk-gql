/* This is a @kibeo/mst-gql generated file, don't modify it manually */
/* eslint-disable */

import { types } from "mobx-state-tree"
import { QueryBuilder  } from "@kibeo/mst-gql"
import { ModelBase } from "./ModelBase"
import { BookModel } from "./BookModel"
import { MovieModel } from "./MovieModel"
import { SearchItemModelSelector } from "./SearchItemModelSelector"


/**
 * SearchResultBase
 * auto generated base class for the model SearchResultModel.
 */
export class SearchResultModelBase extends Model({
    __typename: prop("SearchResult"),
        inputQuery: prop<undefined |types.string>,
    items: prop<undefined |types.array(prop<null |types.union(types.late(() => MovieModel), types.late(() => BookModel))>)>,
  })

export class SearchResultModelSelector extends QueryBuilder {
  get inputQuery() { return this.__attr(`inputQuery`) }
  items(builder) { return this.__child(`items`, SearchItemModelSelector, builder) }
}
export function selectFromSearchResult() {
  return new SearchResultModelSelector()
}

export const searchResultModelPrimitives = selectFromSearchResult().inputQuery
