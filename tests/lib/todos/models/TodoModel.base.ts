/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types, prop, tProp, Model, Ref, idProp } from "mobx-keystone"
import { QueryBuilder } from "mk-gql"




/**
 * TodoBase
 * auto generated base class for the model TodoModel.
 */
export class TodoModelBase extends Model({
    __typename: tProp("Todo"),
        id:prop<string | number>().withSetter(),
    text:prop<string | null>().withSetter(),
    complete:prop<boolean | null>().withSetter(),
  }) {
    getRefId() {
      return String(this.id)
    }
  }

export class TodoModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get text() { return this.__attr(`text`) }
  get complete() { return this.__attr(`complete`) }
}
export function selectFromTodo() {
  return new TodoModelSelector()
}

export const todoModelPrimitives = selectFromTodo().text.complete
