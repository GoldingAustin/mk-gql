/* This is a @kibeo/mst-gql generated file, don't modify it manually */
/* eslint-disable */

import { QueryBuilder } from "@kibeo/mst-gql"
import { OrganizationModelSelector, OrganizationModelType } from "./OrganizationModel"
import { UserModelSelector, UserModelType } from "./UserModel"

export class OwnerModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get name() { return this.__attr(`name`) }
  user(builder) { return this.__inlineFragment(`User`, UserModelSelector, builder) }
  organization(builder) { return this.__inlineFragment(`Organization`, OrganizationModelSelector, builder) }
}
export function selectFromOwner() {
  return new OwnerModelSelector()
}

export const ownerModelPrimitives = selectFromOwner().name