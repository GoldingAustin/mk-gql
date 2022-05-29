
import { applySnapshot, getSnapshot } from "mobx-keystone"

import * as models from './models/root';


describe("unionTypes tests", () => {

  function mockLoadTodoList(query, variables) {
    expect(variables).toEqual(undefined)
    return {
      data: {
        todoLists: [
          {
            id: "c",
            __typename: "TodoList",
            todos: [
              {
                id: "a",
                __typename: "BasicTodo",
                complete: true,
                text: "Initially loaded todo, now updated"
              },
              {
                id: "b",
                __typename: "FancyTodo",
                complete: false,
                label: "Initially loaded todo",
                color: "red"
              }
            ]
          }
        ]
      }
    }
  }

  test("it should rehydrate union types from snapshot correctly", async () => {
    const mockResponses = [mockLoadTodoList]
    const mockClient = {
      request(query, variables) {
        return Promise.resolve(mockResponses.shift()?.(query, variables)) // return and remove the first mocked response
      }
    }
    const store = new models.RootStore({})
    store.gqlHttpClient = mockClient;
    store.ssr = true;

    await store.queryTodoLists()
    expect(
      store.todoLists.get("c")?.todos?.filter((f) => f?.maybeCurrent?.complete)
    ).toHaveLength(1)
    const ss = getSnapshot(store)
    const store2 = new models.RootStore({})
    applySnapshot(store2, ss);


    expect(
      store2.todoLists.get("c")?.todos?.filter((f) => f?.maybeCurrent?.complete)
    ).toHaveLength(1)
  })
})
