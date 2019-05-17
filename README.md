# mst-gql

Bindings for mobx-state-tree and GraphQL

This project can be sponsored through our [open collective](https://opencollective.com/mobx)!

# ⚠ Warning: experimental project ahead ⚠

_This project is an experimental integration between GraphQL and mobx-state-tree. The project will help you to bootstrap mobx-state-tree and graphQL based projects very quickly. However, be aware, there are currently no active maintainers for this project, so we are looking for maintainers that need use project in real life situations and evolve it further!_

To become a maintainer, see: [#1](https://github.com/mobxjs/mst-gql/issues/1) 🙏

That being said, it is pretty safe to adopt this project in the sense that just as scaffolding tool it can be pretty beneficial, even if it doesn't cover all cases of your project.

# 🚀 Installation 🚀

Installation: `yarn add mobx mobx-state-tree mobx-react@6.0.0-rc.4 react react-dom mst-gql`

If you want to use graphql tags, also install: `yarn add graphql graphql-tag`

# 👩‍🎓 Why 👩‍🎓

Both GraphQL and mobx-state-tree are model-first driven approaches, so they have a naturally matching architecture. If you are tired of having your data shapes defined in GraphQL, MobX-state-tree and possible TypeScript as well, this project might be a great help!

Furthermore, this project closes the gap between GraphQL and mobx-state-tree as state management solutions. GraphQL is very transport oriented, while MST is great for client side state management. GraphQL clients like apollo do support some form of client-side state, but that is still quite cumbersome compared to the full model driven power unlocked by MST, where local actions, reactive views, and MobX optimized rendering model be used.

Benefits:

- Model oriented
- Type reuse between GraphQL and MobX-state-tree
- Generates types, queries, mutations and subscription code
- Strongly typed (TypeScript). Auto complete all the things!
- Local views, actions, state and model life-cycles
- Automatic instance reuse
- Built-in support for local storage, caching, query caching, subscriptions (over websockets), optimistic updates
- Idiomatic store organization
- Incremental scaffolding that preserves changes

# 👟 Overview & getting started 👟

The `mst-gql` libraries consists of two parts:

1. Scaffolding
2. A runtime library

The scaffolder is a compile-time utility that generates a MST store and models based on the type information provided by your endpoint. This utility doesn't just generate models for all your types, but also query, mutation and subscription code base on the data statically available.

The runtime library is configured by the scaffolder, and provides entry points to use the generated generated or hand-written queries, React components, and andditional utilities you want to _mixin_ to your stores.

### Scaffolding

To get started,after [installing](#installation) mst-gql and its dependencies, the first task is to scaffold your store and runtime models based on your graphql endpoint.

To scaffold TypeScript models based on a locally running graphQL endpoint on port 4000, run: `yarn mst-gql --format ts http://localhost:4000/graphql`. There are several additional flags that can be passed to the CLI, which are detailed [below](#cli).

Tip: Note that API descriptions found in the graphQL endpoint will generally end up in the generated code, so make sure to write them!

After running the scaffolder, a bunch of files will be generated in the `src/models/` directory of your project (or whatever path your provided):

- `index` - A barrel file that exposes all intersting things generated
- `RootStoreModel` - The store generated by mst-gql that exposes the following stuff
  - Storage for all "root" types (see below)
  - The `.query`, `.mutate` and `.subscribe` low-level api's to run graphql queries
  - Generated `.queryXXX` ,`.mutateXXX` and `.subscribeXXX` actions based on the query definitions found in your graphQL endpoint
  - Any extensions that you will add to the store!
- `XXXModel` mobx-state-tree types per type found in the graphQL endpoint. These expose the following things:
  - All fields will have been translated into MST equivalents
  - A `.store` back-reference to the owning store
  - A `xxxPrimitives` query fragment, that can be used as selector to obtain all the primitive fields of an object type
  - (TypeScript only) a `type` that describes the runtime type of a model instance. These are useful to type parameters and react component properties
- `reactUtils`. This is a set of utilities to be used in React, exposing the following:
  - `StoreContext`: a strongly typed React context, that can be used to make the `RootStore` available through your app
  - `Query`: A react component that can be used to render queries, mutations etc. It is bound to the `StoreContext` automatically.

For the root store and every grapqhl object type, two files will be generated. For example `TodoModel.js` and `TodoModel.base.js`. The `TodoModel.base.js` file holds all the generated code, and will be replaced on every next run of `mst-gql`. The `TodoModel.js` file defines the model that you will actually be using throughout your application. Any further customizations to the type can be made to this file, as explained below.

For example, the following graphQL schema will generate the store and message as shown below:

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
export const MessageModelBase = MSTGQLObject.named("Message")
  .props({
    __typename: types.optional(types.literal("Message"), "Message"),
    id: types.identifier,
    user: MSTGQLRef(types.late(() => User)),
    text: types.string
  })
  .views(self => ({
    get store() {
      return self.__getStore<typeof RootStore.Type>()
    }
  }))
```

`RootStoreModel.base.ts` (shortened):

```typescript
export const RootStoreBase = MSTGQLStore.named("RootStore")
  .extend(
    configureStoreMixin(
      [["Message", () => MessageModel], ["User", () => UserModel]],
      ["Message", "User"]
    )
  )
  .props({
    messages: types.optional(types.map(types.late(() => Message)), {}),
    users: types.optional(types.map(types.late(() => User)), {})
  })
  .actions(self => ({
    queryMessages(
      variables?: {},
      resultSelector = messagePrimitives,
      options: QueryOptions = {}
    ) {
      return self.query<typeof Message.Type[]>(
        `query messages { messages {
        ${resultSelector}
      } }`,
        variables,
        options
      )
    },
    queryMessage(
      variables: { id: string },
      resultSelector = messagePrimitives,
      options: QueryOptions = {}
    ) {
      return self.query<typeof Message.Type>(
        `query message($id: ID!) { message(id: $id) {
        ${resultSelector}
      } }`,
        variables,
        options
      )
    },
    queryMe(
      variables?: {},
      resultSelector = userPrimitives,
      options: QueryOptions = {}
    ) {
      return self.query<typeof User.Type>(
        `query me { me {
        ${resultSelector}
      } }`,
        variables,
        options
      )
    },
    mutateChangeName(
      variables: { id: string; name: string },
      resultSelector = userPrimitives,
      optimisticUpdate?: () => void
    ) {
      return self.mutate<typeof User.Type>(
        `mutation changeName($id: ID!, $name: String!) { changeName(id: $id, name: $name) {
        ${resultSelector}
      } }`,
        variables,
        optimisticUpdate
      )
    },
    subscribeNewMessages(variables?: {}, resultSelector = messagePrimitives) {
      return self.subscribe<typeof Message.Type>(
        `subscription newMessages { newMessages {
        ${resultSelector}
      } }`,
        variables
      )
    }
  }))
```

_(Yes, that is a lot of code. A lot of code that you don't have to write 😇)_

Note that the mutations and queries are now strongly typed! The parameters will be type checked, and the return types of the query methods are correct. Nonetheless, you will often write wrapper methods around those generated actions, to, for example, fine the fragments of the result set that should be retrieved

### Initializing the store

To prepare your app to use the `RootStore`, it needs to be initialized, which is pretty straight forward, so here is quick example of what an entry file might look like:

```typescript
// 1
import React from "react"
import * as ReactDOM from "react-dom"
import "./index.css"

import { App } from "./components/App"

// 2
import { createHttpClient } from "mst-gql"
import { RootStore, StoreContext } from "./models"

// 3
const rootStore = RootStore.create(undefined, {
  gqlHttpClient: createHttpClient("http://localhost:4000/graphql")
})

// 4
ReactDOM.render(
  <StoreContext.Provider value={rootStore}>
    <Home />
  </StoreContext.Provider>,
  document.getElementById("root")
)

// 5
window.store = rootStore
```

1. Typical react stuff, pretty unrelated to this library
2. Bunch of imports that are related to this lib :)
3. When starting our client, we initialize a `rootStore`, which, in typical MST fashion, takes 2 arguments:
   1. The snapshot with the initial state of the client. In this case it is `undefined`, but one could rehydrate server state here, or pick a snapshot from `localStorage`, etc.
   2. The transportation of the store. Either `gqlHttpClient`, `gqlWsClient` or both need to be provided.
4. We initialize rendering. Note that we use `StoreContext.Provider` to make the store available to the rest of the rendering three
5. We expose the store on `window`. This has no practical use, and should be done only in DEV builds. It is a really convenient way to quickly inspect the store, or even fire actions or queries directly from the console of the browser's developer tools. (See this [talk](https://www.youtube.com/watch?v=3J9EJrvqOiM&index=7&t=0s&list=PLW0vzLDjfaNSFs7OBLK6anfQiE5FJzAPD) for some cool benefits of that)

### Loading and rendering your first data

Now, we are ready to write our first React components that use the store! Because the store is a normal MST store, like usual, `observer` based components can be used to render the contents of the store.

However, mst-sql also provides the [Query component](#query-component) that can be used to track the state of an ongoing query or mutation. It can be used in many different ways (see the details below), but here is a quick example:

```typescript
import React from "react"

import { Error, Loading, Message } from "./"
import { Query } from "../models/reactUtils"

export const Home = () => (
  <Query query={store => store.queryMessages()}>
    {({ store, error, data }) => {
      if (error) return <Error>{error.message}</Error>
      if (loading) return <Loading />
      return (
        <ul>
          {data.map(message => (
            <Message key={message.id} message={message} />
          ))}
        </ul>
      )
    }}
  </Query>
)
```

The `Query` component is imported from the generated `reactUtils`, so that it is bound automatically to the right store. The `query` property accepts many different types of arguments, but the most convenient one is to give it a callback that invokes one of the query (or your own) methods on the store. The [Query object](#query-object) returned from that action will be used to automatically update the rendering.

The `Query` component takes a children function that receives, among other things, the `store`, `loading` and `data` fields.

The `Query` component is a convenience utility, but the lower primitives can also be used manually. For example, reactivity is provided by using `observer` from `mobx-react`, and you can manually get the `store` in any component by using for example React's `useContext(StoreContext)`.

### Mutations

Mutations work very similarly to queries. To render a mutation, the `Query` component can be used again. Except, this time we start without a `query` property, only to set it later when a mutation is started. For example the following component uses a custom `toggle` action that wraps a graphQL mutation:

```javascript
import * as React from "react"
import { Query } from "../models/reactUtils"

export const Todo = ({ todo }) => (
  <Query>
    {({ setQuery, loading, error }) => (
      <li onClick={() => setQuery(todo.toggle())}>
        <p className={`${todo.complete ? "strikethrough" : ""}`}>{todo.text}</p>
        {error && <span>Failed to update: {error}</span>}
        {loading && <span>(updating)</span>}
      </li>
    )}
  </Query>
)
```

### Optimistic updates

The Todo model used in the above component is defined as follows:

```javascript
export const TodoModel = TodoModelBase.actions(self => ({
  toggle() {
    return self.store.mutateToggleTodo({ id: self.id }, undefined, () => {
      self.complete = !self.complete
    })
  }
}))
```

There are few things to notice:

1. Our `toggle` action wraps around the generated `mutateToggleTodo` mutation of the base model, giving us a much more convenient client api
2. The Query object created by `mutateToggleTodo` is returned from our action, so that we can pass it (for example) to the `setQuery` as done in the previous listing.
3. We've set the third argument of the mutation, called `optimisticUpdate`. This function is executed immediately when the mutation is created, without awaiting it's result. So that the change becomes immediately visible in the UI. However, MST will record the [patches](https://github.com/mobxjs/mobx-state-tree#patches). If the mutation fails in the future, any changes made inside this `optimisticUpdate` callback will automatically be rolled back by reverse applying the recorded patches!

### Customizing generated files

All `.base` files generated by `mst-sql` should not be touched, as they probably need to be scaffolded again in the future. However, the model definitions themselves can be changed freely!

Thanks to how MST models [compose](https://github.com/mobxjs/mobx-state-tree#creating-models), this means that you can introduce as many additional `views`, `actions` and `props` as you want to your models, by chaining more calls unto the model definitions. Those actions will often wrap around the generated methods, setting some predefined parameters, or composing the queries into bigger operations.

Exampe of a generated model, that introduces a `toggle` action that wraps around one of the generated mutations:

```javascript
// src/models/TodoModel.js
import { TodoModelBase } from "./TodoModel.base"

export const TodoModel = TodoModelBase.actions(self => ({
  toggle() {
    return self.store.mutateToggleTodo({ id: self.id })
  }
}))
```

That's it for the introduction! For the many different ways in which the above can applied in practice, check out the [examples](#examples)

---

# 🍿 In-depth store semantics 🍿

mst-sql generates model types for every object type in your graphql definition. (Except for those exluded using the `excludes` flag). For any query or mutation that is executed by the store, the returned data will be automatically, and recursively parsed into those generated MST models (unless the `raw` flag is set). This means that for any query, you get a 'rich' object back. Finding the right model type is done based on the GraphQL meta field `__typename`, so make sure to include it in your graphql queries!

The philosophy behind MST / mst-sql is that every 'business concept' should exist only once in the client state, so that there is only one source of truth for every message, usage, order, product etc. that you are holding in memory. To achieve this, it is recommended that every uniquely identifyable concept in your application, does have an `id` field of the graphQL `ID` type. By default, any object types for which this is true, is considered to be a "root type".

Root types have few features:

1. It is guaranteed that any data related to the same id will be updating the very same MST model instance.
2. All instances of root types are stored on the RootStore, for quick and easy lookups.
3. If an object is referring to a root type, a true MST `types.reference` will be used to establish the reference. This means you can use deep fields in the UI, like `message.author.name`, despite the fact that this data is stored normalized in the store.
4. Instances of the root types, and all their children, are cached automatically in the root store (until removed manually).

GraphQL has no explicit distinction between compositional and associative relationships between data types. In general, references between graphQL objects are dealt with as follows.

1. If an object is referring to a root type, a `types.reference` is used, e.g.: `author: types.reference(UserModel)`
2. If an object is not referring to a root type, but a matching MST model type exist, a composition relationship is used, for example: `comments: types.array(CommentModel)`
3. If no model type is known for the queried object type, a `types.frozen` is used, and the data as returned from the query is stored literally.

### Dealing with incomplete objects

GraphQL makes it possible to query a subset of the fields of any object. The upside of this is that data traffic can be minimized. The downside is that it cannot be guaranteed that any object is loaded in its 'complete' state. It means that fields might be missing in the client state, even though are defined as being mandatory in the original graphQL object type! To verify which keys are loaded, all models expose the `hasLoaded(fieldName:string):boolean` view, which keeps track of which fields were received at least once from the back-end.

### Query caching

As described above, (root) model instances are kept alive automatically. Beyond that, mst-sql also provides caching on the network level, based on the query string and variables, following the policies of the apollo and urql graphQL clients. The following fetch policies are supported:

- `"cache-first": Use cache if available, avoid network request if possible
- `"cache-only": Use cache if available, or error if this request was not made before
- `"cache-and-network": Use cache, but still send request and update cache in the background
- `"network-only": Skip cache, but cache the result
- `"no-cache": Skip cache, and don't cache the response either

The default policy is `cache-and-network`. This is different from other graphQL clients. But since mst-gql leverages the MobX reactivity system, this means that, possibly stale, results are shown on screen immediately if a response is in cache, and that the screen will automatically update as soon as a new server response arrives.

The query cache in is actually stored in MST as well, and can be accessed through `store.__queryCache`.

Since the query cache is stored in the store, this means that mixins like `useLocalStore` will serialize them. This will help significantly in building offline-first applications.

## To use Query components or not to use Query components

TODO: philosophical section on whether to define the UI purely in terms of stores and models, or whether to control data fetching from the UI

---

# 🦄 API 🦄

## CLI

The `mst-gql` command currently accepts the following arguments:

- `--format ts|js|mjs` The type of files that need to be generated (default: `js`)
- `--outDir <dir>` The output directory of the generated files (default: `src/models`)
- `--excludes 'type1,type2,typeN'` The types that should be omitted during generation, as we are not interested in for this app.
- `--roots 'type1,type2,typeN'` The types that should be used as (root types)[#root-types]
- `--modelsOnly` Generates only models, but no queries or graphQL capabilities. This is great for backend usage, or if you want to create your own root store
- `source` The last argument is the location at which to find the graphQL definitions. This can be
  - a graphql endpoint, like `http://host/graphql`
  - a graphql files, like `schema.graphql`
  - a parsed graphql file, like `schema.json`

## RootStore

The generated RootStore exposes the following members:

#### `query(query, variables, options): Query`

Makes a graphQL request to the backend. The result of the query is by default automatically normalized to model instances as described above. This method is also used by all the automatically scaffolded queries.

- The `query` parameter can be a string, or a `graphql-tag` based query.
- Variables are the raw JSON data structures that should be send as variable substitutions to the backend. This parameter is optional.
- Options is an optional [QueryOptions](#queryoptions) object. The defaults are `raw: false` and `fetchPolicy: "cache-and-network"`
- The method returns a [`Query`](#query-object) that can be inspected to keep track of the request progress.

Use `raw: true` and `fetchPolicy: no-cache` if you want to make a completely side effect free one time request to the backend that gives raw data back.

Be sure to at least select `__typename` and `id` in the result selector, so that mst-gql can normalize the data.

### `mutate(query, variables, optimisticUpdate): Query`

Similar to `query`, but used for mutations. If an `optimisticUpdate` thunk is passed in, that function will be immediately executed so that you can optimistically update the model. However, the patches that are generated by modifying the tree will be stored, so that, if the mutation ultimately fails, the changes can be reverted. See the [Optimistic updates](#optimistic-updates) section for more details

### `subscribe(query, variables): () => void`

Similar to `query`, but sets up an websocket based subscription. The `gqlWsClient` needs to be set during the store creation to make this possible.

### Generated queries, mutations and subscriptions

Based on the queries, mutations and subscriptions defined at the endpoint, mst-sql automatically scaffolds methods for those onto the base root store.

This is very convenient, as you might not need to write any graphQL queries by hand yourself in your application. Beyond that, the queries now become strongly typed. When using TypeScript, both the `variables` and the return type of the query will be correct.

An example signature of a generated query method is:

```typescript
queryPokemons(variables: { first: number }, resultSelector = pokemonModelPrimitives, options: QueryOptions = {}): Query<PokemonModelType[]>
```

All parameters of this query are typically optional (unless some of the variables are requires, like in the above example).

The result selector defines which fields should fetched from the backend. By default mst-gql will fetch `__typename`, `ID` and all primitive fields defined in the model, but full free to override this to make more fine tuned queries! For better reuse, consider doing this in a new action on the appropiate model. For example a query to fetch all comments and likes for a message could look like:

```typescript
import { MessageBaseModel } from "./MessageModel.base"

const MessageModel = MessageBaseModel.actions(self => ({
  queryCommentsAndLikes(): Query<MessageModelType> {
    return store.queryMessage(
      { id: self.id },
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
}))
```

### Other store methods

- Not a method, but `RootStoreType` can be used for all places in TypeScript where you need the instance type of the RootStore.
- `rawRequest(query: string, variables: any): Promise`. Makes a direct, raw, uncached, request to the graphQL server. Should typically not be needed.
- `__queryCache`. See [Query caching](#query-caching). Should typically not be needed.
- `merge(data)`. Merges a raw graphQL response into the store, and returns a new tree with model instances. See [In-depth store semantics](#in-depth-store-semantics). Should typically not be needed.

## Models

The generated models provide storage place for data returned from GraphQL, as explained [above](#in-depth-store-semantics). Beyond that, it is the place where you enrich the models, with client-side only state, actions, derived views, etc.

For convenience, each model does provide two convenience views:

- `hasLoaded(field)` returns `true` if data for the specified field was received from the server
- `store`: a strongly typed back-reference to the RootStore that loaded this model

Beyond that, the the following top-level exports are exposed from each model file:

- `xxxxPrimitives`: A simple string that provides a ready-to-use selector for graphQL queries, that selects all the primitive fields. For example: `"__typename id title text done`
- `xxxModelType`: A TypeScript type definition that can be used in the application if you need to refer to the instance type of this specific model

## QueryOptions

```
export interface QueryOptions {
  raw?: boolean
  fetchPolicy?: FetchPolicy
}
```

See [Query caching](#query-caching) for more details on `fetchPolicy`. Default: `"cache-and-network"`

The `raw` field indicates whether the result set should parsed into model instances, or returned as raw JSOn

## `createHttpClient(url: string, options: HttpClientOptions = {})`

Creates a http client for transportation purposes. For documentation of the options, see: https://github.com/prisma/graphql-request

```typescript
import { createHttpClient } from "mst-gql"
import { RootStore } from "./models/RootStore"

const gqlHttpClient = createHttpClient("http://localhost:4000/graphql")

const rootStore = RootStore.create(undefined, {
  gqlHttpClient
})
```

## Creating a websocket client

Creating a websocket client can be done by using the `subscriptions-transport-ws` package, and passing a client to the store as `gqlWsClient` environment variable:

```typescript
import { SubscriptionClient } from "subscriptions-transport-ws"

import { RootStore } from "./models/RootStore"

const gqlWsClient = new SubscriptionClient("ws://localhost:4001/graphql", {
  reconnect: true
})

const rootStore = RootStore.create(undefined, {
  gqlWsClient
})
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

  // If any error occured, it is stored here
  error: any

  // Forces the query to re-executed and make a new roundtrip to the back-end.
  // The returned promise settles once that request is completed
  refetch = (): Promise<T> => {

  // case takes an object that should have the methods `error`, `loading` and `data`.
  // It immediately calls the appropiate handler based on the current query status.
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

## StoreContext

In the generated `reactUtils` you will find the `StoreContext`, which is a pre-initialized React context that can be used to distribute the RootStore through your application. It's primary benefit is that it is strongly typed, and that `Query` components will automatically pick up the store distributed by this context.

## Query component

The Query component, as found in `reactUtils` (and not to be confused with the [Query object](#query-object)) is a convenient utility if you want to control or render queries or mutations from React components.

It supports the following properties

- `store`, the root store to use to execute the query. Optional and defaults to the store provided through the [`StoreContext`](#storecontext)
- `query`, the query to execute. This parameter can take the following forms:
  - Nothing - the parameter is optional, in case you want to only set the query to be tracked later on using `setQuery`, for example when a mutation should be tracked.
  - A string, e.g. `query messages { allMessages { __typename id message date }}`
  - A `graphql-tag` based template string
  - A [`Query` object](#query-object)
  - A callback, that will receive as first argument the `store`, and should return a `Query` object. The callback will be invoked when the component is rendered for the first time, and is a great way to delegate the query logic itself to the store. This is the recommend approach. For example `store => store.queryAllMessages()`
- The query settings `variables`, `raw` and `fetchPolicy`. Those properties have only meaning when a string or graphql-tag is used as `query`.

The query component takes a render callback, that is rendered based on the current status of the `Query` objects that is created based on the `query` property. The callback is also automatically wrapped in MobX-reacts' `observer` HoC.

The callback receives a single object with the following properties:

- `loading`
- `error`
- `data`
- `store`
- `query` - the current `Query` object
- `setQuery` - replaces the current query being rendered. This is particalary useful for mutations or loading more data

For examples, see the sections [Loading and rendering your first data](#loading-and-rendering-your-first-data) and [Mutations](#mutations).

Tip: The `Query` component is strongly typed, however, due to limitations in the TS type inference, it is not possible to derive the type of `data` from the `query` property. So it might be useful to call the component like `<Query<Message[]> query={store => store.queryAllMessages()}>{({ data }) => ... }`

## `localStorageMixin`

The `localStorageMixin` can be used to automatically safe the full state of the `RootStore`. By default the store is saved after every change, but throttle to be saved once per 5 seconds. (The reason for the trotthling is that, although snapshotting is cheap, serializing a a snapshot to a string is expensive).

Two options are available: `throttle` (in milliseconds) and `storageKey` (the key to be used to store in the local storage).

Example:

```typescript
const RootStore = RootStoreBase.extend(
  localStorageMixin({
    throttle: 1000,
    storageKey: "appFluff"
  })
)
```

# Tips & tricks

TODO:

Modeling ordered retrieval with refs

Mutation should select the fields they change

Data is plain, rather than mst object -> make sure your query includes \_\_typename

Data is MST object, but not merged with the store state -> mase sure your query includes id

Should scaffolded files be generated

Fold sections in VSCode with this [extension](https://marketplace.visualstudio.com/items?itemName=maptz.regionfolder)

Withstore like in example 4

Using getters / setters in views for foreign keys

using mutations, see BookTrips component

.prettierignore file:

```
src/models/index.*
src/models/reactUtils.*
src/models/*.base.*
```

# 🙈 Examples 🙈

Before running the examples, run the following in the root directory:

```
yarn install
yarn prepare-examples
```

All examples start on url http://localhost:3000/

Overview of the examples:

TODO:

1. 2. 3. 4. 5. 6.

Basic http / mst-sql classes / optimistic update

Scaffolding

webservices, scaffolded classes

more in depth example TODO: create diff branch / MR link with the changes

# 💥 Roadmap 💥

- [ ] implement example 5 / add prisma demo with standardized api's
- [ ] clean up readme example
- [ ] tests
- [ ] fix tests in the examples
- [ ] create PR to show diff on the apollo example
- [ ] CI
- [ ] clean up / beautify example 5-todos
- [ ] clean up rootstore in apollo example, many queries are now defined twice
- [ ] all fields should be generated as optional
- [ ] stubHttpClient
- [ ] QueryViewModel for order retrievals and such
- [ ] Turn QueryObject into a MST model

#### Quite random iddeas

- [ ] add cli flag to also regenerate entry files
- [ ] support json config file
- [ ] Don't generate queries / mutations into the root store, but as static utilities, so that unused ones can be tree-shaken away
- [ ] automatically insert \_\_typename in gql tag queries, like apollo client does
- [ ] package react stuff separately, add `--no-react` flag to CLI
- [ ] add // prettier, eslint ignore comments
- [ ] support a config file instead of CLI args
- [ ] auto load / auto save?
- [ ] offline actions?
- [ ] use apollo client / urql instead of grapqhl-request as back-end?
- [ ] be able to specify ownership between types?
- [ ] add post run comment option to cli, to run e.g. prettier / eslint --fix ?
- [ ] generate generation data + mst-sql version into file headers
- [ ] Lerna for simpler repo setup
- [ ] add support for identifier attributes not called \_id
