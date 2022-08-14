/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import { types, prop, tProp, Model, Ref, idProp } from "mobx-keystone"
import { QueryBuilder } from "mk-gql"




/**
 * BookBase
 * auto generated base class for the model BookModel.
 */
export class BookModelBase extends Model({
    __typename: tProp("Book"),
        description:prop<string>().withSetter(),
    author:prop<string>().withSetter(),
  }) {
    
  }

export class BookModelSelector extends QueryBuilder {
  get description() { return this.__attr(`description`) }
  get author() { return this.__attr(`author`) }
}
export function selectFromBook() {
  return new BookModelSelector()
}

export const bookModelPrimitives = selectFromBook().description.author
