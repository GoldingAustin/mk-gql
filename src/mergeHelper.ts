import { resolveIdentifier, destroy } from "mobx-state-tree"
import { values } from "mobx"
import { typenameToCollectionName } from "./utils"

export function mergeHelper(store: any, data: any, del: boolean) {
  function merge(data: any, del: boolean): any {
    if (!data || typeof data !== "object") return data
    if (Array.isArray(data)) return data.map(d => merge(d, del))

    const { __typename, id } = data

    // convert values deeply first to MST objects as much as possible
    const snapshot: any = {}
    for (const key in data) {
      snapshot[key] = merge(data[key], del)
    }

    // GQL object
    if (__typename && store.isKnownType(__typename)) {
      // GQL object with known type, instantiate or recycle MST object
      const typeDef = store.getTypeDef(__typename)
      // Try to reuse instance, even if it is not a root type
      let instance = id !== undefined && resolveIdentifier(typeDef, store, id)
      if (instance) {
        // update existing object
        Object.assign(instance, snapshot)
      } else {
        // create a new one
        instance = typeDef.create(snapshot)
        if (store.isRootType(__typename)) {
          // register in the store if a root
          //store[typenameToCollectionName(__typename)].set(id, instance)
          store[store.getCollectionName(__typename)] &&
            store[store.getCollectionName(__typename)].set(id, instance)
        }
        instance.__setStore(store)
      }
      return instance
    } else {
      // GQL object with unknown type, return verbatim
      return snapshot
    }
  }

  const items = merge(data, false)
  if (del) {
    const key = Object.keys(items)[0]
    const parsedItems = items[key]
    const item = parsedItems[0]
    let storeKey = key
    if (item) {
      const { __typename } = item
      storeKey = typenameToCollectionName(__typename)
    }
    values(store[storeKey]).forEach((d: any) => {
      const ind = parsedItems.findIndex((it: any) => it.id === d.id)
      if (ind < 0) {
        destroy(d)
      }
    })
  }
  return items
}
