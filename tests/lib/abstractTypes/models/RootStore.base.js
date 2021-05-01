/* This is a @kibeo/mst-gql generated file, don't modify it manually */
/* eslint-disable */
import { types } from "mobx-state-tree"
import { MSTGQLStore, configureStoreMixin } from "@kibeo/mst-gql"

import { SearchResultModel, searchResultModelPrimitives, SearchResultModelSelector  } from "./SearchResultModel"
import { MovieModel, movieModelPrimitives, MovieModelSelector  } from "./MovieModel"
import { BookModel, bookModelPrimitives, BookModelSelector  } from "./BookModel"
import { RepoModel, repoModelPrimitives, RepoModelSelector  } from "./RepoModel"
import { UserModel, userModelPrimitives, UserModelSelector  } from "./UserModel"
import { OrganizationModel, organizationModelPrimitives, OrganizationModelSelector  } from "./OrganizationModel"

import { searchItemModelPrimitives, SearchItemModelSelector  } from "./"
import { ownerModelPrimitives, OwnerModelSelector  } from "./"






/**
* Store, managing, among others, all the objects received through graphQL
*/
export const RootStoreBase = MSTGQLStore
  .named("RootStore")
  .extend(configureStoreMixin([['SearchResult', () => SearchResultModel], ['Movie', () => MovieModel], ['Book', () => BookModel], ['Repo', () => RepoModel], ['User', () => UserModel], ['Organization', () => OrganizationModel]], ['SearchResult', 'Repo']))
  .props({
    searchresults: types.optional(types.map(types.late(() => SearchResultModel)), {}),
    repos: types.optional(types.map(types.late(() => RepoModel)), {})
  })
  .actions(self => ({
    querySearch(variables, resultSelector = searchResultModelPrimitives.toString() , options = {}, clean) {
      return self.query(`query search($text: String!) { search(text: $text) {
        ${typeof resultSelector === "function" ? resultSelector(SearchResultModelSelector).toString() : resultSelector}
      } }`, variables, options, !!clean)
    },
    queryGetAllRepos(variables, resultSelector = repoModelPrimitives.toString() , options = {}, clean) {
      return self.query(`query getAllRepos { getAllRepos {
        ${typeof resultSelector === "function" ? resultSelector(RepoModelSelector).toString() : resultSelector}
      } }`, variables, options, !!clean)
    },
    mutateAddRepo(variables, resultSelector = repoModelPrimitives.toString() , optimisticUpdate) {
      return self.mutate(`mutation addRepo($name: String!, $ownerName: String!, $avatar: String, $logo: String) { addRepo(name: $name, ownerName: $ownerName, avatar: $avatar, logo: $logo) {
        ${typeof resultSelector === "function" ? resultSelector(RepoModelSelector).toString() : resultSelector}
      } }`, variables, optimisticUpdate)
    },
  }))
