import { ExtendedModel, model } from "mobx-keystone"
import { RepoModelBase } from "./RepoModel.base"

/* A graphql query fragment builders for RepoModel */
export { selectFromRepo, repoModelPrimitives, RepoModelSelector } from "./RepoModel.base"

/**
 * RepoModel
 */
@model('Repo')
export class RepoModel extends ExtendedModel(RepoModelBase, {}) {}
