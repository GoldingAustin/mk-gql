/* This is a @kibeo/mst-gql generated file, don't modify it manually */
/* eslint-disable */

import { types } from "mobx-state-tree"
import { QueryBuilder  } from "@kibeo/mst-gql"
import { ModelBase } from "./ModelBase"


/**
 * MovieBase
 * auto generated base class for the model MovieModel.
 */
export class MovieModelBase extends Model({
    __typename: prop("Movie"),
        description: prop<undefined |types.string>,
    director: prop<undefined |types.string>,
  })

export class MovieModelSelector extends QueryBuilder {
  get description() { return this.__attr(`description`) }
  get director() { return this.__attr(`director`) }
}
export function selectFromMovie() {
  return new MovieModelSelector()
}

export const movieModelPrimitives = selectFromMovie().description.director
