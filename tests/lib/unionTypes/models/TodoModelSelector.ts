/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import { QueryBuilder } from "mk-gql"
import { BasicTodoModel, BasicTodoModelSelector, basicTodoModelPrimitives } from "./BasicTodoModel"
import { FancyTodoModel, FancyTodoModelSelector, fancyTodoModelPrimitives } from "./FancyTodoModel"

export type TodoUnion = BasicTodoModel | FancyTodoModel

export class TodoModelSelector extends QueryBuilder {
  basicTodo(builder?: string | BasicTodoModelSelector | ((selector: BasicTodoModelSelector) => BasicTodoModelSelector)) { return this.__inlineFragment(`BasicTodo`, BasicTodoModelSelector, builder) }
  fancyTodo(builder?: string | FancyTodoModelSelector | ((selector: FancyTodoModelSelector) => FancyTodoModelSelector)) { return this.__inlineFragment(`FancyTodo`, FancyTodoModelSelector, builder) }
}
export function selectFromTodo() {
  return new TodoModelSelector()
}

// provides all primitive fields of union member types combined together
export const todoModelPrimitives = selectFromTodo().basicTodo(basicTodoModelPrimitives).fancyTodo(fancyTodoModelPrimitives)