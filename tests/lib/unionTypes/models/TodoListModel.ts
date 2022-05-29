import { ExtendedModel, model } from "mobx-keystone"
import { TodoListModelBase } from "./TodoListModel.base"

/* A graphql query fragment builders for TodoListModel */
export { selectFromTodoList, todoListModelPrimitives, TodoListModelSelector } from "./TodoListModel.base"

/**
 * TodoListModel
 */
@model('TodoList')
export class TodoListModel extends ExtendedModel(TodoListModelBase, {}) {}
