import { ExtendedModel, model } from "mobx-keystone"
import { OrganizationModelBase } from "./OrganizationModel.base"

/* A graphql query fragment builders for OrganizationModel */
export {
  selectFromOrganization,
  organizationModelPrimitives,
  OrganizationModelSelector
} from "./OrganizationModel.base"

/**
 * OrganizationModel
 */
@model("Organization")
export class OrganizationModel extends ExtendedModel(OrganizationModelBase, {}) {}
