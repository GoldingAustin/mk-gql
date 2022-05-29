import { ExtendedModel, model } from "mobx-keystone"
import { BookModelBase } from "./BookModel.base"

/* A graphql query fragment builders for BookModel */
export { selectFromBook, bookModelPrimitives, BookModelSelector } from "./BookModel.base"

/**
 * BookModel
 */
@model("Book")
export class BookModel extends ExtendedModel(BookModelBase, {}) {}
