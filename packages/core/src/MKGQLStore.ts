import camelcase from "camelcase"
import { AbstractModelClass, ExtendedModel, Model, model, modelAction, objectMap, prop } from "mobx-keystone"
import pluralize from "pluralize"
import { deflateHelper } from "./deflateHelper"

import { Query, QueryOptions } from "./Query"

export interface RequestHandler<T = any> {
  request(query: string, variables: any): Promise<T>
}
export type Store = MKGQLStore & { merge: (data: any, del: boolean) => any }

@model("MKGQLStore")
export class MKGQLStore extends Model({
  __queryCache: prop(() => objectMap<string>()),
  isAttached: prop(false),
  enableCache: prop<boolean>(true)
}) {
  ssr: boolean = false
  __promises: Map<string, Promise<unknown>> = new Map()
  __afterInit: boolean = false
  gqlHttpClient: RequestHandler | undefined
  middleWare: any

  @modelAction
  middleware(item: any) {
    this.middleWare && this.middleWare(item)
  }

  @modelAction
  resolveReference(type: any, id: any) {
    // @ts-ignore
    const accessor = this.getCollectionName(type.toLowerCase())
    return this[accessor] && this[accessor].get(id)
  }

  @modelAction
  deflate(data: unknown) {
    return deflateHelper(this, data)
  }

  @modelAction
  rawRequest(query: string, variables: any): Promise<any> | undefined {
    try {
      if (this.gqlHttpClient && this.gqlHttpClient.request) return this.gqlHttpClient.request(query, variables)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  @modelAction
  query<T>(query: string, variables?: any, options: QueryOptions = {}, del?: boolean): Query<T> {
    return new Query(this as unknown as Store, query, variables, options, !!del)
  }

  @modelAction
  mutate<T>(mutation: string, variables?: any, optimisticUpdate?: () => void): Query<T> {
    return this.query(mutation, variables, {
      fetchPolicy: "network-only",
      delete: mutation.toLowerCase().includes("delete")
    })
  }

  __pushPromise(promise: Promise<{}> | undefined, queryKey: string) {
    if (promise) {
      this.__promises.set(queryKey, promise)
      const onSettled = () => this.__promises.delete(queryKey)
      promise.then(onSettled, onSettled)
    }
  }

  __runInStoreContext<T>(fn: () => T) {
    return fn()
  }

  __cacheResponse(key: string, response: any) {
    this.__queryCache.set(key, response)
  }

  __onAfterInit() {
    this.__afterInit = true
  }
}

export function createMKGQLStore<T extends AbstractModelClass<any>>(
  knownTypes: [string, () => any][],
  rootTypes: string[],
  namingConvention?: string
): T {
  @model("MKGQL")
  class CreatedStore extends ExtendedModel(MKGQLStore, {}) {
    kt = new Map()
    rt = new Set(rootTypes)
    isKnownType(typename: string): boolean {
      return this.kt.has(typename)
    }
    isRootType(typename: string): boolean {
      return this.rt.has(typename)
    }
    getTypeDef(typename: string): typeof Model {
      return this.kt.get(typename)!
    }
    @modelAction async merge(data: unknown, del: boolean) {
      // @ts-ignore
      return await this.mergeHelper.mergeAll(data, del)
    }
    getCollectionName(typename: string): string {
      if (namingConvention == "js") {
        // Pluralize only last word (pluralize may fail with words that are
        // not valid English words as is the case with LongCamelCaseTypeNames)
        const newName = camelcase(typename)
        const parts = newName.split(/(?=[A-Z])/)
        parts[parts.length - 1] = pluralize(parts[parts.length - 1])
        return parts.join("")
      }
      return typename.toLowerCase() + "s"
    }
    onInit() {
      if (super.onInit) super.onInit()
      knownTypes.forEach(([key, typeFn]) => {
        const type = typeFn()
        if (!type) throw new Error(`The type provided for '${key}' is empty. Probably this is a module loading issue`)
        this.kt.set(key, type)
      })
    }
  }
  return CreatedStore as unknown as T
}

export function configureStoreMixin(
  knownTypes: [string, () => typeof Model][],
  rootTypes: string[],
  namingConvention?: string
) {
  const kt = new Map()
  const rt = new Set(rootTypes)
  return () => ({
    actions: {
      afterCreate() {
        // initialized lazily, so that there are no circular dep issues
        knownTypes.forEach(([key, typeFn]) => {
          const type = typeFn()
          if (!type) throw new Error(`The type provided for '${key}' is empty. Probably this is a module loading issue`)
          kt.set(key, type)
        })
      }
    },
    views: {
      isKnownType(typename: string): boolean {
        return kt.has(typename)
      },
      isRootType(typename: string): boolean {
        return rt.has(typename)
      },
      getTypeDef(typename: string): typeof Model {
        return kt.get(typename)!
      },
      getCollectionName(typename: string): string {
        if (namingConvention == "js") {
          // Pluralize only last word (pluralize may fail with words that are
          // not valid English words as is the case with LongCamelCaseTypeNames)
          const newName = camelcase(typename)
          const parts = newName.split(/(?=[A-Z])/)
          parts[parts.length - 1] = pluralize(parts[parts.length - 1])
          return parts.join("")
        }
        return typename.toLowerCase() + "s"
      }
    }
  })
}

export type MKGQLStoreType = MKGQLStore
