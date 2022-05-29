import { ExtendedModel, model } from "mobx-keystone"
import { SearchResultModelBase } from "./SearchResultModel.base"

/* A graphql query fragment builders for SearchResultModel */
export { selectFromSearchResult, searchResultModelPrimitives, SearchResultModelSelector } from "./SearchResultModel.base"

/**
 * SearchResultModel
 */
@model('SearchResult')
export class SearchResultModel extends ExtendedModel(SearchResultModelBase, {}) {}
