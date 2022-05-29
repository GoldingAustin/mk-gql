/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types, prop, tProp, Model, Ref, idProp } from "mobx-keystone"
import { QueryBuilder } from "mk-gql"




/**
 * OrganizationBase
 * auto generated base class for the model OrganizationModel.
 */
export class OrganizationModelBase extends Model({
    __typename: tProp("Organization"),
        id:prop<string | number>().withSetter(),
    name:prop<string>().withSetter(),
    logo:prop<string>().withSetter(),
  }) {
    getRefId() {
      return String(this.id)
    }
  }

export class OrganizationModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get name() { return this.__attr(`name`) }
  get logo() { return this.__attr(`logo`) }
}
export function selectFromOrganization() {
  return new OrganizationModelSelector()
}

export const organizationModelPrimitives = selectFromOrganization().name.logo
