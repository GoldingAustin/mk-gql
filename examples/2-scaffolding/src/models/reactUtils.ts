/* This is a @kibeo/mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { createStoreContext, createUseQueryHook } from "@kibeo/mst-gql"
import * as React from "react"
import { RootStore, RootStoreType } from "./RootStore"

export const StoreContext = createStoreContext<RootStoreType>(React)

export const useQuery = createUseQueryHook(StoreContext, React)
