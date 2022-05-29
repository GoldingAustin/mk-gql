/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types, prop, tProp, Model, Ref, idProp } from "mobx-keystone"
import { QueryBuilder } from "mk-gql"


import { OrganizationModel } from "./OrganizationModel"
import { OwnerModelSelector } from "./OwnerModelSelector"
import { UserModel } from "./UserModel"


/**
 * RepoBase
 * auto generated base class for the model RepoModel.
 */
export class RepoModelBase extends Model({
    __typename: tProp("Repo"),
        id:prop<string | number>().withSetter(),
    owner:prop<(UserModel | OrganizationModel) | null>().withSetter(),
  }) {
    getRefId() {
      return String(this.id)
    }
  }

export class RepoModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  owner(builder?: string | OwnerModelSelector | ((selector: OwnerModelSelector) => OwnerModelSelector)) { return this.__child(`owner`, OwnerModelSelector, builder) }
}
export function selectFromRepo() {
  return new RepoModelSelector()
}

export const repoModelPrimitives = selectFromRepo()
