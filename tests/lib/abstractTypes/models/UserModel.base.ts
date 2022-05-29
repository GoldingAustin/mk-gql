/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types, prop, tProp, Model, Ref, idProp } from "mobx-keystone"
import { QueryBuilder } from "mk-gql"




/**
 * UserBase
 * auto generated base class for the model UserModel.
 */
export class UserModelBase extends Model({
    __typename: tProp("User"),
        id:prop<string | number>().withSetter(),
    name:prop<string | null>().withSetter(),
    avatar:prop<string | null>().withSetter(),
  }) {
    getRefId() {
      return String(this.id)
    }
  }

export class UserModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get name() { return this.__attr(`name`) }
  get avatar() { return this.__attr(`avatar`) }
}
export function selectFromUser() {
  return new UserModelSelector()
}

export const userModelPrimitives = selectFromUser().name.avatar
