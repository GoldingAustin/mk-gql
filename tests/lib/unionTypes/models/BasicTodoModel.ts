import { ExtendedModel, model } from "mobx-keystone"
import { BasicTodoModelBase } from "./BasicTodoModel.base"

/* A graphql query fragment builders for BasicTodoModel */
export { selectFromBasicTodo, basicTodoModelPrimitives, BasicTodoModelSelector } from "./BasicTodoModel.base"

/**
 * BasicTodoModel
 */
@model("BasicTodo")
export class BasicTodoModel extends ExtendedModel(BasicTodoModelBase, {}) {}
