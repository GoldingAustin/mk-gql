/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
import type { ObservableMap } from "mobx"
import { types, prop, tProp, Ref, Model, modelAction, objectMap, detach, model, findParent, customRef, ExtendedModel, AbstractModelClass } from "mobx-keystone"
import { MKGQLStore, createMKGQLStore, QueryOptions } from "mk-gql"
import { MergeHelper } from './mergeHelper';

import { TodoModel, todoModelPrimitives, TodoModelSelector  } from "./TodoModel"



/* The TypeScript type that explicits the refs to other models in order to prevent a circular refs issue */


type Refs = {
  todos: ObservableMap<string, TodoModel>
}


/**
* Enums for the names of base graphql actions
*/
export enum RootStoreBaseQueries {
queryTodos="queryTodos"
}
export enum RootStoreBaseMutations {
mutateToggleTodo="mutateToggleTodo"
}

/**
* Store, managing, among others, all the objects received through graphQL
*/
export class RootStoreBase extends ExtendedModel(createMKGQLStore<AbstractModelClass<MKGQLStore>>([['Todo', () => TodoModel]], ['Todo'] , "js"),{
    todos: prop(() => objectMap<TodoModel>()), 
    mergeHelper: prop<MergeHelper>(() => new MergeHelper({}))
  }) {
  
    @modelAction queryTodos(variables?: {  }, resultSelector: string | ((qb: typeof TodoModelSelector) => typeof TodoModelSelector) = todoModelPrimitives.toString() , options: QueryOptions = {}, clean?: boolean) {
      return this.query<{ todos: TodoModel[]}>(`query todos { todos {
        ${typeof resultSelector === "function" ? resultSelector(TodoModelSelector).toString() : resultSelector}
      } }`, variables, options, !!clean)
    }
    @modelAction mutateToggleTodo(variables: { id: string | number }, resultSelector: string | ((qb: typeof TodoModelSelector) => typeof TodoModelSelector) = todoModelPrimitives.toString() , optimisticUpdate?: () => void) {
      return this.mutate<{ toggleTodo: TodoModel}>(`mutation toggleTodo($id: ID!) { toggleTodo(id: $id) {
        ${typeof resultSelector === "function" ? resultSelector(TodoModelSelector).toString() : resultSelector}
      } }`, variables, optimisticUpdate)
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

export const todosRef = appRef<TodoModel>(RootStoreBase, "Todo", 'todos')
    
  export const rootRefs = {
  todos: todosRef
}
