import { Instance } from "mobx-state-tree"
import { RootStoreBase } from "./RootStore.base"

export interface RootStoreType extends Instance<typeof RootStore.Type> {}

export const RootStore = RootStoreBase
