/* This is a mst-sql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { MSTGQLObject, MSTGQLRef } from "mst-gql"
import { RootStore } from "./index"


/**
* PokemonEvolutionRequirement
 *
 * Represents a Pokémon's requirement to evolve
*/
export const PokemonEvolutionRequirementModel = MSTGQLObject
  .named('PokemonEvolutionRequirement')
  .props({
    __typename: types.optional(types.literal("PokemonEvolutionRequirement"), "PokemonEvolutionRequirement"),
    /** The amount of candy to evolve */
    amount: types.optional(types.integer, 0),
    /** The name of the candy to evolve */
    name: types.optional(types.string, ''),
  })
  .views(self => ({
    get store() {
      return self.__getStore<typeof RootStore.Type>()
    }
  }))

export const pokemonEvolutionRequirementPrimitives = `
__typename
amount
name
`

