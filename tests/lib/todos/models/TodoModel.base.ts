/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import { types, prop, tProp, Model, Ref, idProp } from "mobx-keystone"
import { QueryBuilder } from "mk-gql"




/**
 * TodoBase
 * auto generated base class for the model TodoModel.
 */
export class TodoModelBase extends Model({
    __typename: tProp("Todo"),
        id:prop<string | number | null>().withSetter(),
    text:prop<string>().withSetter(),
    complete:prop<boolean>().withSetter(),
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
