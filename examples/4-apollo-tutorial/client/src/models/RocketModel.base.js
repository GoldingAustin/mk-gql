/* This is a mst-sql generated file, don't modify it manually */
/* eslint-disable */

import { types } from "mobx-state-tree"
import { MSTGQLObject, MSTGQLRef, QueryBuilder } from "mst-gql"


import { RootStore } from "./index"

/**
 * RocketBase
 * auto generated base class for the model RocketModel.
 */
export const RocketModelBase = MSTGQLObject
  .named('Rocket')
  .props({
    __typename: types.optional(types.literal("Rocket"), "Rocket"),
    id: types.identifier,
    name: types.maybe(types.string),
    type: types.maybe(types.string),
  })
  .views(self => ({
    get store() {
      return self.__getStore()
    }
  }))

export class RocketModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get name() { return this.__attr(`name`) }
  get type() { return this.__attr(`type`) }

}

export function selectFromRocket() {
  return new RocketModelSelector()
}

export const rocketModelPrimitives = selectFromRocket().id.name.type.toString()

