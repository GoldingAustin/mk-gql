import * as React from "react"
import { observer } from "mobx-react-lite"

import { TodoModelType } from "../models"
import { useQuery } from "../models/reactUtils"

export const Todo = observer(({ todo }: { todo: TodoModelType }) => {
  const { setQuery, loading, error } = useQuery(undefined)

  return (
    <li onClick={() => setQuery(todo.toggle())}>
      <p className={`${todo.complete ? "strikethrough" : ""}`}>{todo.text}</p>
      {error && <span>Failed to update</span>}
      {loading && <span>(updating)</span>}
    </li>
  )
})
