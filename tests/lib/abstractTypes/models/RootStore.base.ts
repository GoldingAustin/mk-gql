/* This is a mk-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */
import type { ObservableMap } from "mobx"
import { types, prop, tProp, Ref, Model, modelAction, objectMap, detach, model, findParent, customRef, ExtendedModel, AbstractModelClass } from "mobx-keystone"
import { MKGQLStore, createMKGQLStore, QueryOptions } from "mk-gql"
import { MergeHelper } from './mergeHelper';

import { SearchResultModel, searchResultModelPrimitives, SearchResultModelSelector  } from "./SearchResultModel"
import { MovieModel, movieModelPrimitives, MovieModelSelector  } from "./MovieModel"
import { BookModel, bookModelPrimitives, BookModelSelector  } from "./BookModel"
import { RepoModel, repoModelPrimitives, RepoModelSelector  } from "./RepoModel"
import { UserModel, userModelPrimitives, UserModelSelector  } from "./UserModel"
import { OrganizationModel, organizationModelPrimitives, OrganizationModelSelector  } from "./OrganizationModel"

import { searchItemModelPrimitives , SearchItemUnion } from "./SearchItemModelSelector"
import { ownerModelPrimitives , OwnerUnion } from "./OwnerModelSelector"


/* The TypeScript type that explicits the refs to other models in order to prevent a circular refs issue */


type Refs = {
  searchResults: ObservableMap<string, SearchResultModel>,
  repos: ObservableMap<string, RepoModel>
}


/**
* Enums for the names of base graphql actions
*/
export enum RootStoreBaseQueries {
querySearch="querySearch",
queryGetAllRepos="queryGetAllRepos"
}
export enum RootStoreBaseMutations {
mutateAddRepo="mutateAddRepo"
}

/**
* Store, managing, among others, all the objects received through graphQL
*/
export class RootStoreBase extends ExtendedModel(createMKGQLStore<AbstractModelClass<MKGQLStore>>([['SearchResult', () => SearchResultModel], ['Movie', () => MovieModel], ['Book', () => BookModel], ['Repo', () => RepoModel], ['User', () => UserModel], ['Organization', () => OrganizationModel]], ['SearchResult', 'Repo'] , "js"),{
    searchResults: prop(() => objectMap<SearchResultModel>()),
    repos: prop(() => objectMap<RepoModel>()), 
    mergeHelper: prop<MergeHelper>(() => new MergeHelper({}))
  }) {
  
    @modelAction querySearch(variables: { text: string  }, resultSelector: string | ((qb: typeof SearchResultModelSelector) => typeof SearchResultModelSelector) = searchResultModelPrimitives.toString() , options: QueryOptions = {}, clean?: boolean) {
      return this.query<{ search: SearchResultModel}>(`query search($text: String!) { search(text: $text) {
        ${typeof resultSelector === "function" ? resultSelector(SearchResultModelSelector).toString() : resultSelector}
      } }`, variables, options, !!clean)
    }
    @modelAction queryGetAllRepos(variables?: {  }, resultSelector: string | ((qb: typeof RepoModelSelector) => typeof RepoModelSelector) = repoModelPrimitives.toString() , options: QueryOptions = {}, clean?: boolean) {
      return this.query<{ getAllRepos: RepoModel[]}>(`query getAllRepos { getAllRepos {
        ${typeof resultSelector === "function" ? resultSelector(RepoModelSelector).toString() : resultSelector}
      } }`, variables, options, !!clean)
    }
    @modelAction mutateAddRepo(variables: { name: string , ownerName: string , avatar?: string | null, logo?: string | null }, resultSelector: string | ((qb: typeof RepoModelSelector) => typeof RepoModelSelector) = repoModelPrimitives.toString() , optimisticUpdate?: () => void) {
      return this.mutate<{ addRepo: RepoModel}>(`mutation addRepo($name: String!, $ownerName: String!, $avatar: String, $logo: String) { addRepo(name: $name, ownerName: $ownerName, avatar: $avatar, logo: $logo) {
        ${typeof resultSelector === "function" ? resultSelector(RepoModelSelector).toString() : resultSelector}
      } }`, variables, optimisticUpdate)
    }
  }
  function resolve(path, obj={}, separator='.') {
    const properties = Array.isArray(path) ? path : path.split(separator)
    return properties.reduce((prev, curr) => prev && prev[curr], obj)
}

export const appRef = <T extends object>(storeInstance, modelTypeId, path) =>
  customRef<T>(`RootStore/${modelTypeId}`, {
    resolve: (ref: Ref<any>) =>
      resolve(path, findParent<typeof storeInstance>(ref, (n) => n instanceof storeInstance))?.get(ref?.id),
    onResolvedValueChange(ref, newItem, oldItem) {
      if (oldItem && !newItem) detach(ref);
    },
  });

export const searchResultsRef = appRef<SearchResultModel>(RootStoreBase, "SearchResult", 'searchResults')
    
export const reposRef = appRef<RepoModel>(RootStoreBase, "Repo", 'repos')
    
  export const rootRefs = {
  searchResults: searchResultsRef,
  repos: reposRef
}
