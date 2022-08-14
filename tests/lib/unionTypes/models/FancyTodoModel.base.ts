/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import { types, prop, tProp, Model, Ref, idProp } from "mobx-keystone"
import { QueryBuilder } from "mk-gql"




/**
 * FancyTodoBase
 * auto generated base class for the model FancyTodoModel.
 */
export class FancyTodoModelBase extends Model({
    __typename: tProp("FancyTodo"),
        id:prop<string | number | null>().withSetter(),
    label:prop<string | null>().withSetter(),
    color:prop<string | null>().withSetter(),
    complete:prop<boolean | null>().withSetter(),
  }) {
    getRefId() {
      return String(this.id)
    }
  }

export class FancyTodoModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get label() { return this.__attr(`label`) }
  get color() { return this.__attr(`color`) }
  get complete() { return this.__attr(`complete`) }
}
export function selectFromFancyTodo() {
  return new FancyTodoModelSelector()
}

export const fancyTodoModelPrimitives = selectFromFancyTodo().label.color.complete
