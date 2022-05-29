/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { QueryBuilder } from "mk-gql"
import { OrganizationModel, OrganizationModelSelector } from "./OrganizationModel"
import { UserModel, UserModelSelector } from "./UserModel"

export type OwnerUnion = UserModel | OrganizationModel

export class OwnerModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get name() { return this.__attr(`name`) }
  user(builder?: string | UserModelSelector | ((selector: UserModelSelector) => UserModelSelector)) { return this.__inlineFragment(`User`, UserModelSelector, builder) }
  organization(builder?: string | OrganizationModelSelector | ((selector: OrganizationModelSelector) => OrganizationModelSelector)) { return this.__inlineFragment(`Organization`, OrganizationModelSelector, builder) }
}
export function selectFromOwner() {
  return new OwnerModelSelector()
}

export const ownerModelPrimitives = selectFromOwner().name