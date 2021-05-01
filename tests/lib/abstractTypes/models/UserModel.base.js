/* This is a @kibeo/mst-gql generated file, don't modify it manually */
/* eslint-disable */

import { types } from "mobx-state-tree"
import { QueryBuilder  } from "@kibeo/mst-gql"
import { ModelBase } from "./ModelBase"


/**
 * UserBase
 * auto generated base class for the model UserModel.
 */
export class UserModelBase extends Model({
    __typename: prop("User"),
        id: prop<undefined |types.string | number>,
    name: prop<undefined |types.string>,
    avatar: prop<undefined |types.string>,
  })

export class UserModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get name() { return this.__attr(`name`) }
  get avatar() { return this.__attr(`avatar`) }
}
export function selectFromUser() {
  return new UserModelSelector()
}

export const userModelPrimitives = selectFromUser().name.avatar
