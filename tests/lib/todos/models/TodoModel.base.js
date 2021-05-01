/* This is a @kibeo/mst-gql generated file, don't modify it manually */
/* eslint-disable */

import { types } from "mobx-state-tree"
import { QueryBuilder  } from "@kibeo/mst-gql"
import { ModelBase } from "./ModelBase"


/**
 * TodoBase
 * auto generated base class for the model TodoModel.
 */
export class TodoModelBase extends Model({
    __typename: prop("Todo"),
        id: prop<undefined |null |types.string | number>,
    text: prop<undefined |types.string>,
    complete: prop<undefined |types.boolean>,
  })

export class TodoModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get text() { return this.__attr(`text`) }
  get complete() { return this.__attr(`complete`) }
}
export function selectFromTodo() {
  return new TodoModelSelector()
}

export const todoModelPrimitives = selectFromTodo().text.complete
