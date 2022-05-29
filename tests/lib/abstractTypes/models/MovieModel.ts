import { ExtendedModel, model } from "mobx-keystone"
import { MovieModelBase } from "./MovieModel.base"

/* A graphql query fragment builders for MovieModel */
export { selectFromMovie, movieModelPrimitives, MovieModelSelector } from "./MovieModel.base"

/**
 * MovieModel
 */
@model("Movie")
export class MovieModel extends ExtendedModel(MovieModelBase, {}) {}
