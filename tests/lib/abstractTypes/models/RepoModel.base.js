/* This is a @kibeo/mst-gql generated file, don't modify it manually */
/* eslint-disable */

import { types } from "mobx-state-tree"
import { QueryBuilder  } from "@kibeo/mst-gql"
import { ModelBase } from "./ModelBase"
import { OrganizationModel } from "./OrganizationModel"
import { OwnerModelSelector } from "./OwnerModelSelector"
import { UserModel } from "./UserModel"


/**
 * RepoBase
 * auto generated base class for the model RepoModel.
 */
export class RepoModelBase extends Model({
    __typename: prop("Repo"),
        id: prop<undefined |types.string | number>,
    owner: prop<undefined |null |types.union(types.late(() => UserModel), types.late(() => OrganizationModel))>,
  })

export class RepoModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  owner(builder) { return this.__child(`owner`, OwnerModelSelector, builder) }
}
export function selectFromRepo() {
  return new RepoModelSelector()
}

export const repoModelPrimitives = selectFromRepo()
