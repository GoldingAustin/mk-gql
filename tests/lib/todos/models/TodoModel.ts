import { ExtendedModel, model, modelAction } from "mobx-keystone"
import { TodoModelBase } from "./TodoModel.base"

/* A graphql query fragment builders for TodoModel */
export { selectFromTodo, todoModelPrimitives, TodoModelSelector } from "./TodoModel.base"

/**
 * TodoModel
 */
@model('Todo')
export class TodoModel extends ExtendedModel(TodoModelBase, {}) {
  @modelAction toggle() {
    this.complete = !this.complete;
  }
}
