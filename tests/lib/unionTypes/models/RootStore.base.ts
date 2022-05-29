/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */
import type { ObservableMap } from "mobx"
import { types, prop, tProp, Ref, Model, modelAction, objectMap, detach, model, findParent, customRef, ExtendedModel, AbstractModelClass } from "mobx-keystone"
import { MKGQLStore, createMKGQLStore, QueryOptions } from "mk-gql"
import { MergeHelper } from './mergeHelper';

import { TodoListModel, todoListModelPrimitives, TodoListModelSelector  } from "./TodoListModel"
import { BasicTodoModel, basicTodoModelPrimitives, BasicTodoModelSelector  } from "./BasicTodoModel"
import { FancyTodoModel, fancyTodoModelPrimitives, FancyTodoModelSelector  } from "./FancyTodoModel"

import { todoModelPrimitives , TodoUnion } from "./TodoModelSelector"


/* The TypeScript type that explicits the refs to other models in order to prevent a circular refs issue */


type Refs = {
  todoLists: ObservableMap<string, TodoListModel>,
  basicTodos: ObservableMap<string, BasicTodoModel>,
  fancyTodos: ObservableMap<string, FancyTodoModel>
}


/**
* Enums for the names of base graphql actions
*/
export enum RootStoreBaseQueries {
queryTodoLists="queryTodoLists"
}


/**
* Store, managing, among others, all the objects received through graphQL
*/
export class RootStoreBase extends ExtendedModel(createMKGQLStore<AbstractModelClass<MKGQLStore>>([['TodoList', () => TodoListModel], ['BasicTodo', () => BasicTodoModel], ['FancyTodo', () => FancyTodoModel]], ['TodoList', 'BasicTodo', 'FancyTodo'] , "js"),{
    todoLists: prop(() => objectMap<TodoListModel>()),
    basicTodos: prop(() => objectMap<BasicTodoModel>()),
    fancyTodos: prop(() => objectMap<FancyTodoModel>()), 
    mergeHelper: prop<MergeHelper>(() => new MergeHelper({}))
  }) {
  
    @modelAction queryTodoLists(variables?: {  }, resultSelector: string | ((qb: typeof TodoListModelSelector) => typeof TodoListModelSelector) = todoListModelPrimitives.toString() , options: QueryOptions = {}, clean?: boolean) {
      return this.query<{ todoLists: TodoListModel[]}>(`query todoLists { todoLists {
        ${typeof resultSelector === "function" ? resultSelector(TodoListModelSelector).toString() : resultSelector}
      } }`, variables, options, !!clean)
    }
  }
  function resolve(path, obj={}, separator='.') {
    const properties = Array.isArray(path) ? path : path.split(separator)
    return properties.reduce((prev, curr) => prev && prev[curr], obj)
}

export const appRef = <T extends object>(storeInstance, modelTypeId, path) =>
  customRef<T>(`RootStore/${modelTypeId}`, {
    resolve: (ref: Ref<any>) =>
      resolve(path, findParent<typeof storeInstance>(ref, (n) => n instanceof storeInstance))?.get(ref?.id),
    onResolvedValueChange(ref, newItem, oldItem) {
      if (oldItem && !newItem) detach(ref);
    },
  });

export const todoListsRef = appRef<TodoListModel>(RootStoreBase, "TodoList", 'todoLists')
    
export const basicTodosRef = appRef<BasicTodoModel>(RootStoreBase, "BasicTodo", 'basicTodos')
    
export const fancyTodosRef = appRef<FancyTodoModel>(RootStoreBase, "FancyTodo", 'fancyTodos')
    
  export const rootRefs = {
  todoLists: todoListsRef,
  basicTodos: basicTodosRef,
  fancyTodos: fancyTodosRef
}
