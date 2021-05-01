/* This is a @kibeo/mst-gql generated file, don't modify it manually */
/* eslint-disable */

import { types } from "mobx-state-tree"
import { QueryBuilder  } from "@kibeo/mst-gql"
import { ModelBase } from "./ModelBase"


/**
 * OrganizationBase
 * auto generated base class for the model OrganizationModel.
 */
export class OrganizationModelBase extends Model({
    __typename: prop("Organization"),
        id: prop<undefined |types.string | number>,
    name: prop<undefined |types.string>,
    logo: prop<undefined |types.string>,
  })

export class OrganizationModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get name() { return this.__attr(`name`) }
  get logo() { return this.__attr(`logo`) }
}
export function selectFromOrganization() {
  return new OrganizationModelSelector()
}

export const organizationModelPrimitives = selectFromOrganization().name.logo
