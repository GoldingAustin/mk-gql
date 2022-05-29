import { ExtendedModel, model } from "mobx-keystone"
import { UserModelBase } from "./UserModel.base"

/* A graphql query fragment builders for UserModel */
export { selectFromUser, userModelPrimitives, UserModelSelector } from "./UserModel.base"

/**
 * UserModel
 */
@model("User")
export class UserModel extends ExtendedModel(UserModelBase, {}) {}
