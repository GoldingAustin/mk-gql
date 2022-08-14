/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import { types, prop, tProp, Model, Ref, idProp } from "mobx-keystone"
import { QueryBuilder } from "mk-gql"


import { BasicTodoModel } from "./BasicTodoModel"
import { FancyTodoModel } from "./FancyTodoModel"
import { TodoModelSelector } from "./TodoModelSelector"


/**
 * TodoListBase
 * auto generated base class for the model TodoListModel.
 */
export class TodoListModelBase extends Model({
    __typename: tProp("TodoList"),
        id:prop<string | number>().withSetter(),
    todos:prop<(Ref<BasicTodoModel> | Ref<FancyTodoModel>)[]>(() => []).withSetter(),
  }) {
    getRefId() {
      return String(this.id)
    }
  }

export class TodoListModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  todos(builder?: string | TodoModelSelector | ((selector: TodoModelSelector) => TodoModelSelector)) { return this.__child(`todos`, TodoModelSelector, builder) }
}
export function selectFromTodoList() {
  return new TodoListModelSelector()
}

export const todoListModelPrimitives = selectFromTodoList()
