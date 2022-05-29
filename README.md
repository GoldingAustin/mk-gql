# mk-gql

Bindings for mobx-keystone and GraphQL Forked from [mst-gql project](https://github.com/mobxjs/mst-gql) written by [Michel Weststrate](https://twitter.com/mweststrate)

# 🚀 Installation 🚀

Installation: `yarn add mobx mobx-keystone mk-gql graphql-request graphql`

If you want to use graphql tags, also install: `yarn add graphql graphql-tag`

# 👩‍🎓 Why 👩‍🎓

The mst-gql README has an [excellent synopsis](https://github.com/mobxjs/mst-gql#-why-)

# 👟 Overview & getting started 👟

The `mk-gql` libraries consists of two parts:

1. Scaffolding
2. A runtime library

The scaffolder is a compile-time utility that generates a mobx-keystone store and models based on the type information provided by your endpoint. This utility doesn't just generate models for all your types, but also query, mutation and subscription code base on the data statically available.

The runtime library is configured by the scaffolder, and provides entry points to use the generated or hand-written queries, React components, and additional utilities you want to _mixin_ to your stores.

### Scaffolding

To get started, after [installing](#-installation-) mk-gql and its dependencies, the first task is to scaffold your store and runtime models based on your graphql endpoint.

To scaffold TypeScript models based on a locally running graphQL endpoint on port 4000, run: `yarn mk-gql --format ts http://localhost:4000/graphql`. There are several additional args that can be passed to the CLI or put in a config file. Both are detailed [below](#cli).

Tip: Note that API descriptions found in the graphQL endpoint will generally end up in the generated code, so make sure to write them!

After running the scaffolder, a bunch of files will be generated in the `src/models/` directory of your project (or whatever path your provided):

_(Files marked ✏ can and should be edited. They won't be overwritten when you scaffold unless you use the `force` option.)_

- `index` - A barrel file that exposes all interesting things generated
- `RootStore.base` - A mobx-keystone store that acts as a graphql client. Provides the following:
  - Storage for all "root" types (see below)
  - The `.query`, `.mutate` and `.subscribe` low-level api's to run graphql queries
  - Generated `.queryXXX` ,`.mutateXXX` and `.subscribeXXX` actions based on the query definitions found in your graphQL endpoint
- ✏ `RootStore` - Extends `RootStore.base` with any custom logic. This is the version we actually export and use.
- ✏ `ModelBase` - Extends mk-gql's abstract model type with any custom logic, to be inherited by every concrete model type.
- `XXXModel.base` mobx-keystone types per type found in the graphQL endpoint. These inherit from ModelBase and expose the following things:
  - All fields will have been translated into mobx-keystone classes and TypeScript types
  - A `xxxPrimitives` query fragment, that can be used as selector to obtain all the primitive fields of an object type
- ✏ `XXXModel` - Extends `XXXModdel.base` with any custom logic. Again, this is the version we actually use.

The following graphQL schema will generate the store and message as shown below:

```graphql
type User {
  id: ID
  name: String!
  avatar: String!
}
type Message {
  id: ID
  user: User!
  text: String!
}
type Query {
  messages: [Message]
  message(id: ID!): Message
  me: User
}
type Subscription {
  newMessages: Message
}
type Mutation {
  changeName(id: ID!, name: String!): User
}
```

`MessageModel.base.ts` (shortened):

```typescript
export class MessageModelBase extends Model({
  __typename: tProp("Message"),
  id: prop<string | number>().withSetter(),
  user: prop<Ref<UserModel>>().withSetter(),
  text: prop<string | null>().withSetter()
}) {}
```

`RootStore.base.ts` (shortened):

```typescript
export class RootStoreBase extends ExtendedModel(
  createMKGQLStore<AbstractModelClass<MKGQLStore>>(
    [
      ["Message", () => MessageModel],
      ["User", () => UserModel]
    ],
    ["Message", "User"],
    "js"
  ),
  {
    messages: prop(() => objectMap<MessageModel>()),
    users: prop(() => objectMap<UserModel>()),
    mergeHelper: prop<MergeHelper>(() => new MergeHelper({}))
  }
) {
  @modelAction queryMessages(
    variables?: {},
    resultSelector:
      | string
      | ((
          qb: typeof MessageModelSelector
        ) => typeof MessageModelSelector) = messageModelPrimitives.toString(),
    options: QueryOptions = {},
    clean?: boolean
  ) {
    // implementation omitted
  }

  @modelAction mutateChangeName(
    variables: { id: string | number; name: string },
    resultSelector:
      | string
      | ((
          qb: typeof UserModelSelector
        ) => typeof UserModelSelector) = userModelPrimitives.toString(),
    optimisticUpdate?: () => void
  ) {
    // implementation omitted
  }
}
```

_(Yes, that is a lot of code. A lot of code that you don't have to write 😇)_

Note that the mutations and queries are now strongly typed! The parameters will be type checked, and the return types of the query methods are correct. Nonetheless, you will often write wrapper methods around those generated actions, to, for example, define the fragments of the result set that should be retrieved.

### Initializing the store

To prepare your app to use the `RootStore`, it needs to be initialized, which is pretty straight forward, so here is quick example of what an entry file might look like:

```typescript
// 1
import { createHttpClient } from "mk-gql"
import { RootStore, StoreContext } from "./models"
import { Root } from "postcss"

// 2
const rootStore = new RootStore()
rootStore.gqlHttpClient = createHttpClient("http://localhost:4000/graphql")

// 3
// Use within a frontend framework using context or server side
```

To select multiple fields, simply keep "dotting", as the query is a fluent interface. For example: `user => user.firstname.lastname.avatar` selects 3 fields.

Complex children can be selected by calling the field as function, and provide a callback to that field function (which in turn is again a query builder for the appropriate type). So the following example selector selects the `timestamp` and `text` of a message. The `name` and `avatar` inside the `user` property, and finally also the `likes` properties. For the `likes` no further subselector was specified, which means that only `__typename` and `id` will be retrieved.

```javascript
// prettier-ignore
;msg => msg
  .timestamp
  .text
  .user(user => user.name.avatar)
  .likes()
  .toString()
```

To create reusable query fragments, instead the following syntax can be used:

```javascript
import { selectFromMessage } from "./MessageModel.base"

// prettier-ignore
export const MESSAGE_FRAGMENT = selectFromMessage()
  .timestamp
  .text
  .user(user => user.name.avatar)
  .likes()
  .toString()
```

### Customizing generated files

You can customize all of the defined mk types: `RootStore`, `ModelBase`, and every `XXXModel`.

**However**, some files (including but not limited to `.base` files) should not be touched, as they probably need to be scaffolded again in the future.

Thanks to how mobx-keystone models [compose](https://github.com/mobxjs/mobx-keystone#creating-models), this means that you can introduce as many additional `views`, `actions` and `props` as you want to your models, by chaining more calls unto the model definitions. Those actions will often wrap around the generated methods, setting some predefined parameters, or composing the queries into bigger operations.

Example of a generated model, that introduces a `toggle` action that wraps around one of the generated mutations:

```javascript
// src/models/TodoModel.ts
@model("Todo")
export class TodoModel extends ExtendedModel(TodoModelBase, {}) {
  @modelAction toggle() {
    this.complete = !this.complete
  }
}
```

### null vs. undefined

Because you can control what data is fetched for a model in graphql and mk-gql it is possible for a model to have some fields that have not yet been fetched from the server. This can complicate things when we're talking about a field that can also be "empty". To help with this a field in mk-gql will be `undefined` when it has not been fetched from the server and, following graphql conventions, will be `null` if the field has been fetched but is in fact empty.

---

# 🍿 In-depth store semantics 🍿

mk-gql generates model types for every object type in your graphql definition. (Except for those excluded using the `excludes` flag). For any query or mutation that is executed by the store, the returned data will be automatically, and recursively parsed into those generated mobx-keystone models. This means that for any query, you get a 'rich' object back. Finding the right model type is done based on the GraphQL meta field `__typename`, so make sure to include it in your graphql queries!

The philosophy behind mobx-keystone / mk-gql is that every 'business concept' should exist only once in the state, so that there is only one source of truth for every message, usage, order, product etc. that you are holding in memory. To achieve this, it is recommended that every uniquely identifyable concept in your application, does have an `id` field of the graphQL `ID` type. By default, any object types for which this is true, is considered to be a "root type".

Root types have few features:

1. It is guaranteed that any data related to the same id will be updating the very same mobx-keystone model instance.
2. All instances of root types are stored on the RootStore, for quick and easy lookups.
3. If an object is referring to a root type, a true mobx-keystone `Ref` will be used to establish the reference. This means you can use deep fields in the UI, like `message.author.current.name`, despite the fact that this data is stored normalized in the store.
4. Instances of the root types, and all their children, are cached automatically in the root store (until removed manually).

GraphQL has no explicit distinction between compositional and associative relationships between data types. In general, references between graphQL objects are dealt with as follows.

1. If an object is referring to a root type, a `Ref` is used, e.g.: `author: prop<Ref<UserModel>()`
2. If an object is not referring to a root type, but a matching mobx-keystone model type exist, a composition relationship is used, for example: `comments: prop<CommentModel[]>()`

### Query caching

As described above, (root) model instances are kept alive automatically. Beyond that, mk-gql also provides caching on the network level, based on the query string and variables, following the policies of the apollo and urql graphQL clients. The following fetch policies are supported:

- `"cache-first": Use cache if available, avoid network request if possible
- `"cache-only": Use cache if available, or error if this request was not made before
- `"cache-and-network": Use cache, but still send request and update cache in the background
- `"network-only": Skip cache, but cache the result
- `"no-cache": Skip cache, and don't cache the response either

The default policy is `cache-and-network`. This is different from other graphQL clients. But since mk-gql leverages the MobX reactivity system, this means that, possibly stale, results are shown on screen immediately if a response is in cache, and that the screen will automatically update as soon as a new server response arrives.

The query cache is actually stored in mobx-keystone as well, and can be accessed through `store.__queryCache`.

Since the query cache is stored in the store, this means that mixins like `useLocalStore` will serialize them. This will help significantly in building offline-first applications.

---

# 🦄 API 🦄

## CLI

The `mk-gql` command currently accepts the following arguments:

- `--outDir <dir>` The output directory of the generated files (default: `src/models`)
- `--excludes 'type1,type2,typeN'` The types that should be omitted during generation, as we are not interested in for this app.
- `--roots 'type1,type2,typeN'` The types that should be used as (root types)[#root-types]
- `--modelsOnly` Generates only models, but no queries or graphQL capabilities. This is great for backend usage, or if you want to create your own root store
- `--force` When set, exiting files will always be overridden. This will drop all customizations of model classes!
- `--dontRenameModels` By default generates model names from graphql schema types that are idiomatic Javascript/Typescript names, ie. type names will be PascalCased and root collection names camelCased. With `--dontRenameModels` the original names - as provided by the graphql schema - will be used for generating models.
- `--fieldOverrides id:uuid:numver,*:ID:number` Overrides default mobx-keystone types for matching GraphQL names and types. The format is `gqlFieldName:gqlFieldType:mkType`. Supports full or partial wildcards for fieldNames, and full wildcards for fieldTypes. Case Sensitive. If multiple matches occur, the match with the least amount of wildcards will be used, followed by the order specified in the arg list if there are still multiple matches. Some examples:

  - `*_id:*:string` - Matches any GQL type with the field name `*_id` (like `user_id`), and uses the typescript type `string`
  - `User.user_id:ID:number` - Matches the `user_id` field on `User` with the GQL type `ID`, and uses the typescript type `number`

- `source` The last argument is the location at which to find the graphQL definitions. This can be
  - a graphql endpoint, like `http://host/graphql`
  - a graphql files, like `schema.graphql`
  - a parsed graphql file, like `schema.json`

### Config

`mk-gql` also supports [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) as an alternative to using cli arguments.

## RootStore

The generated RootStore exposes the following members:

#### `query(query, variables, options): Query`

Makes a graphQL request to the backend. The result of the query is by default automatically normalized to model instances as described above. This method is also used by all the automatically scaffolded queries.

- The `query` parameter can be a string, or a `graphql-tag` based query.
- Variables are the raw JSON data structures that should be send as variable substitutions to the backend. This parameter is optional.
- Options is an optional [QueryOptions](#queryoptions) object. The defaults are `fetchPolicy: "cache-and-network"` and `noSsr: false`
- The method returns a [`Query`](#query-object) that can be inspected to keep track of the request progress.

Be sure to at least select `__typename` and `id` in the result selector, so that mk-gql can normalize the data.

### `mutate(query, variables, optimisticUpdate): Query`

Similar to `query`, but used for mutations. If an `optimisticUpdate` thunk is passed in, that function will be immediately executed so that you can optimistically update the model. However, the patches that are generated by modifying the tree will be stored, so that, if the mutation ultimately fails, the changes can be reverted. See the [Optimistic updates](#optimistic-updates) section for more details.

### `subscribe(query, variables, onData): () => void`

Similar to `query`, but sets up an websocket based subscription. The `gqlWsClient` needs to be set during the store creation to make this possible. `onData` can be provided as callback for when new data arrives.

Example initalization:

```js
import { SubscriptionClient } from "subscriptions-transport-ws"
```

build a websocket client:

```js
// see: https://www.npmjs.com/package/subscriptions-transport-ws#hybrid-websocket-transport
const gqlWsClient = new SubscriptionClient(constants.graphQlWsUri, {
  reconnect: true,
  connectionParams: {
    headers: { authorization: `Bearer ${tokenWithRoles}` }
  }
})
```

add the ws client when creating the store:

```js
const store = new RootStore({})
store.gqlHttpClient = gqlHttpClient
store.gqlWsClient = gqlWsClient
```

When using server side rendered tools like gatsby/next/nuxt it is necessary to prevent using subscriptions server side. An error will occur because the server is missing a websocket implementation. [See code example for gatsby](https://github.com/mobxjs/mk-gql/issues/247#issuecomment-642494006).

### Generated queries, mutations and subscriptions

Based on the queries, mutations and subscriptions defined at the endpoint, mk-gql automatically scaffolds methods for those onto the base root store.

This is very convenient, as you might not need to write any graphQL queries by hand yourself in your application. Beyond that, the queries now become strongly typed. When using TypeScript, both the `variables` and the return type of the query will be correct.

An example signature of a generated query method is:

```typescript
queryPokemons(variables: { first: number }, resultSelector = pokemonModelPrimitives, options: QueryOptions = {}): Query<PokemonModelType[]>
```

All parameters of this query are typically optional (unless some of the variables are requires, like in the above example).

The result selector defines which fields should fetched from the backend. By default mk-gql will fetch `__typename`, `ID` and all primitive fields defined in the model, but feel free to override this to make more fine tuned queries! For better reuse, consider doing this in a new action on the appropiate model. For example a query to fetch all comments and likes for a message could look like:

```typescript
import { MessageBaseModel } from "./MessageModel.base"
import { modelAction } from "mobx-keystone"

@model("Message")
export class MessageModel extends ExtendedModel(MessageModelBase, {}) {
  @modelAction queryCommentsAndLikes(): Query<MessageModelType> {
    return store.queryMessage(
      { id: this.id },
      `
        id
        __typename
        comments {
          id
          __typename
          text
          likes {
            __typename
            author
          }
        }
      `
    )
  }
}
```

### Other store methods

- Not a method, but `RootStore` can be used for all places in TypeScript where you need the instance type of the RootStore.
- `rawRequest(query: string, variables: any): Promise`. Makes a direct, raw, uncached, request to the graphQL server. Should typically not be needed.
- `__queryCache`. See [Query caching](#query-caching). Should typically not be needed.
- `merge(data)`. Merges a raw graphQL response into the store, and returns a new tree with model instances. See [In-depth store semantics](#in-depth-store-semantics). Should typically not be needed.

## Models

The generated models provide storage place for data returned from GraphQL, as explained [above](#in-depth-store-semantics). Beyond that, it is the place where you enrich the models, with client-side only state, actions, derived views, etc.

For convenience, each model does provide two convenience views:

- `hasLoaded(field)` returns `true` if data for the specified field was received from the server
- `store`: a strongly typed back-reference to the RootStore that loaded this model

Beyond that, the the following top-level exports are exposed from each model file:

- `xxxPrimitives`: A simple string that provides a ready-to-use selector for graphQL queries, that selects all the primitive fields. For example: `"__typename id title text done`
- `xxxModelType`: A TypeScript type definition that can be used in the application if you need to refer to the instance type of this specific model
- `selectFromXXX()`: Returns a strongly typed querybuilder that can be used to write graphql result selector fragments more easily. Don't forget to call `toString()` in the end!

## QueryOptions

```
export interface QueryOptions {
  fetchPolicy?: FetchPolicy
  noSsr?: boolean
}
```

See [Query caching](#query-caching) for more details on `fetchPolicy`. Default: `"cache-and-network"`

The `noSsr` field indicates whether the query should be executed during Server Side Rendering, or skipped there and only executed once the page is loaded in the browser. Default: `false`

## `createHttpClient(url: string, options: HttpClientOptions = {})`

Creates a http client for transportation purposes. For documentation of the options, see: https://github.com/prisma/graphql-request

```typescript
import { createHttpClient } from "mk-gql"
import { RootStore } from "./models/RootStore"

const gqlHttpClient = createHttpClient("http://localhost:4000/graphql")

const rootStore = new RootStore({})
rootStore.gqlHttpClient = gqlHttpClient
```

## Creating a websocket client

Creating a websocket client can be done by using the `subscriptions-transport-ws` package, and passing a client to the store as `gqlWsClient` environment variable:

```typescript
import { SubscriptionClient } from "subscriptions-transport-ws"

import { RootStore } from "./models/RootStore"

const gqlWsClient = new SubscriptionClient("ws://localhost:4001/graphql", {
  reconnect: true
})

const rootStore = new RootStore({})
rootStore.gqlWsClient = gqlWsClient
```

## Query object

Query objects capture the state of a specific query. These objects are returned from all `query` and `mutate` actions. Query objects are fully reactive, which means that if you use them in `observer` component, or any other reactive MobX mechanism, such as `autorun` or `when`, they can be tracked.

Beyond that, query objects are also then-able, which means that you can use them as a promise. The complete type of a query object is defined as follows:

```typescript
class Query<T> implements PromiseLike<T> {
  // Whether the Query is currently fetching data from the back-end
  loading: boolean

  // The data that was fetched for this query.
  // Note that data might be available, even when the query object is still loading,
  // depending on the fetchPolicy
  data: T | undefined

  // If any error occurred, it is stored here
  error: any

  // Forces the query to re-executed and make a new roundtrip to the back-end.
  // The returned promise settles once that request is completed
  refetch = (): Promise<T> => {

  // case takes an object that should have the methods `error`, `loading` and `data`.
  // It immediately calls the appropriate handler based on the current query status.
  // Great tool to use in a reactive context, comparable with mobx-utils.fromPromise
  case<R>(handlers: {
    loading(): R
    error(error: any): R
    data(data: T): R
  }): R

  // Returns the promise for the currently ongoing request
  // (note that for example `refetch` will cause a new promise to become the current promise)
  currentPromise()

  // A short-cut to the .then handler of the current promise
  then(onResolve, onError)
```
