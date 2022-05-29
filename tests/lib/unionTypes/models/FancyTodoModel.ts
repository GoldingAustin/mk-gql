import { ExtendedModel, model } from "mobx-keystone"
import { FancyTodoModelBase } from "./FancyTodoModel.base"

/* A graphql query fragment builders for FancyTodoModel */
export { selectFromFancyTodo, fancyTodoModelPrimitives, FancyTodoModelSelector } from "./FancyTodoModel.base"

/**
 * FancyTodoModel
 */
@model('FancyTodo')
export class FancyTodoModel extends ExtendedModel(FancyTodoModelBase, {}) {}
