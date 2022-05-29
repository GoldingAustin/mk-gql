/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types, prop, tProp, Model, Ref, idProp } from "mobx-keystone"
import { QueryBuilder } from "mk-gql"




/**
 * BasicTodoBase
 * auto generated base class for the model BasicTodoModel.
 */
export class BasicTodoModelBase extends Model({
    __typename: tProp("BasicTodo"),
        id:prop<string | number>().withSetter(),
    text:prop<string | null>().withSetter(),
    complete:prop<boolean | null>().withSetter(),
  }) {
    getRefId() {
      return String(this.id)
    }
  }

export class BasicTodoModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get text() { return this.__attr(`text`) }
  get complete() { return this.__attr(`complete`) }
}
export function selectFromBasicTodo() {
  return new BasicTodoModelSelector()
}

export const basicTodoModelPrimitives = selectFromBasicTodo().text.complete
