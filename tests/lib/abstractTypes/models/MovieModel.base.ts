/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import { types, prop, tProp, Model, Ref, idProp } from "mobx-keystone"
import { QueryBuilder } from "mk-gql"




/**
 * MovieBase
 * auto generated base class for the model MovieModel.
 */
export class MovieModelBase extends Model({
    __typename: tProp("Movie"),
        description:prop<string>().withSetter(),
    director:prop<string>().withSetter(),
  }) {
    
  }

export class MovieModelSelector extends QueryBuilder {
  get description() { return this.__attr(`description`) }
  get director() { return this.__attr(`director`) }
}
export function selectFromMovie() {
  return new MovieModelSelector()
}

export const movieModelPrimitives = selectFromMovie().description.director
