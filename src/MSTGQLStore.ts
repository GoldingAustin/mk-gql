import camelcase from "camelcase"
import {
  getEnv,
  getParent,
  IAnyModelType,
  Instance,
  recordPatches,
  types
} from "mobx-state-tree"
import pluralize from "pluralize"
import { SubscriptionClient } from "subscriptions-transport-ws"
import { deflateHelper } from "./deflateHelper"

import { mergeHelper } from "./mergeHelper"
import { Query, QueryOptions } from "./Query"
import { getFirstValue } from "./utils"

export interface RequestHandler<T = any> {
  request(query: string, variables: any): Promise<T>
}

// TODO: also provide an interface for stream handler

export const MSTGQLStore = types
  .model("MSTGQLStore", {
    __queryCache: types.optional(types.map(types.frozen()), {}),
    isAttached: types.optional(types.boolean, false)
  })
  .volatile((self): {
    ssr: boolean
    __promises: Map<string, Promise<unknown>>
    __afterInit: boolean
  } => {
    let parent
    try {
      parent = getParent(self)
    } catch (e) {
      //
    }
    const {
      ssr = false
    }: {
      ssr: boolean
    } = parent && getEnv(parent).ssr ? getEnv(parent) : getEnv(self)
    return {
      ssr,
      __promises: new Map(),
      __afterInit: false
    }
  })
  .actions((self) => {
    Promise.resolve().then(() => (self as any).__onAfterInit())
    Promise.resolve().then(() => (self as any).afterAttach())
    function middleware(item: any) {
      let parent
      try {
        parent = getParent(self)
      } catch (e) {
        //
      }
      const middleware: <T>(arg: T) => T | undefined =
        parent && getEnv(parent)?.middleware
          ? getEnv(parent).middleware
          : getEnv(self)?.middleware
          ? getEnv(self).middleware
          : undefined
      middleware?.(item)
    }

    function merge(data: unknown, del: boolean) {
      return mergeHelper(self, data, del)
    }

    function deflate(data: unknown) {
      return deflateHelper(self, data)
    }

    function rawRequest(query: string, variables: any): Promise<any> {
      let parent
      try {
        parent = getParent(self)
      } catch (e) {
        //
      }
      const {
        gqlHttpClient, // TODO: rename to requestHandler
        gqlWsClient // TODO: rename to streamHandler
      }: {
        gqlHttpClient: RequestHandler
        gqlWsClient: SubscriptionClient
      } =
        parent && (getEnv(parent).gqlHttpClient || getEnv(parent).gqlWsClient)
          ? getEnv(parent)
          : getEnv(self)
      try {
        if (gqlHttpClient && gqlHttpClient.request)
          return gqlHttpClient.request(query, variables)
        else {
          return new Promise((resolve, reject) => {
            if (gqlWsClient && gqlWsClient.request) {
              gqlWsClient
                .request({
                  query,
                  variables
                })
                .subscribe({
                  next(data) {
                    resolve(data.data)
                  },
                  error: reject
                })
            } else {
              reject("Failed to fetch")
            }
          })
        }
      } catch (e) {
        return Promise.reject(e)
      }
    }

    function query<T>(
      query: string,
      variables?: any,
      options: QueryOptions = {},
      del?: boolean
    ): Query<T> {
      return new Query(self as StoreType, query, variables, options, !!del)
    }

    function mutate<T>(
      mutation: string,
      variables?: any,
      optimisticUpdate?: () => void
    ): Query<T> {
      if (optimisticUpdate) {
        const recorder = recordPatches(self)
        optimisticUpdate()
        recorder.stop()
        const q = query<T>(mutation, variables, {
          fetchPolicy: "network-only",
          delete: mutation.toLowerCase().includes("delete")
        })
        q.currentPromise().catch(() => {
          recorder.undo()
        })
        return q
      } else {
        return query(mutation, variables, {
          fetchPolicy: "network-only",
          delete: mutation.toLowerCase().includes("delete")
        })
      }
    }

    // N.b: the T is ignored, but it does simplify code generation
    function subscribe<T = any>(
      query: string,
      variables?: any,
      onData?: (item: T) => void,
      onError: (error: Error) => void = (error) => {
        throw error
      }
    ): () => void {
      let parent
      try {
        parent = getParent(self)
      } catch (e) {
        //
      }
      const {
        gqlHttpClient, // TODO: rename to requestHandler
        gqlWsClient // TODO: rename to streamHandler
      }: {
        gqlHttpClient: RequestHandler
        gqlWsClient: SubscriptionClient
      } =
        parent && (getEnv(parent).gqlHttpClient || getEnv(parent).gqlWsClient)
          ? getEnv(parent)
          : getEnv(self)
      if (!gqlWsClient) throw new Error("No WS client available")
      const sub = gqlWsClient
        .request({
          query,
          variables
        })
        .subscribe({
          next(data) {
            if (data.errors) {
              return onError(new Error(JSON.stringify(data.errors)))
            }
            ;(self as any).__runInStoreContext(() => {
              const res = (self as any).merge(getFirstValue(data.data))
              if (onData) onData(res)
              return res
            })
          }
        })
      return () => sub.unsubscribe()
    }

    // exposed actions
    return {
      merge,
      deflate,
      mutate,
      query,
      subscribe,
      middleware,
      rawRequest,
      __pushPromise(promise: Promise<{}>, queryKey: string) {
        self.__promises.set(queryKey, promise)
        const onSettled = () => self.__promises.delete(queryKey)
        promise.then(onSettled, onSettled)
      },
      __runInStoreContext<T>(fn: () => T) {
        return fn()
      },
      __cacheResponse(key: string, response: any) {
        self.__queryCache.set(key, response)
      },
      afterAttach() {
        self.isAttached = true
      },
      __onAfterInit() {
        self.__afterInit = true
      }
    }
  })

export function configureStoreMixin(
  knownTypes: [string, () => IAnyModelType][],
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
          if (!type)
            throw new Error(
              `The type provided for '${key}' is empty. Probably this is a module loading issue`
            )
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
      getTypeDef(typename: string): IAnyModelType {
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

export interface StoreType extends Instance<typeof MSTGQLStore> {}
