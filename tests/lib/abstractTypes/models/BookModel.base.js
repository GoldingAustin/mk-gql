/* This is a @kibeo/mst-gql generated file, don't modify it manually */
/* eslint-disable */

import { types } from "mobx-state-tree"
import { QueryBuilder  } from "@kibeo/mst-gql"
import { ModelBase } from "./ModelBase"


/**
 * BookBase
 * auto generated base class for the model BookModel.
 */
export class BookModelBase extends Model({
    __typename: prop("Book"),
        description: prop<undefined |types.string>,
    author: prop<undefined |types.string>,
  })

export class BookModelSelector extends QueryBuilder {
  get description() { return this.__attr(`description`) }
  get author() { return this.__attr(`author`) }
}
export function selectFromBook() {
  return new BookModelSelector()
}

export const bookModelPrimitives = selectFromBook().description.author
