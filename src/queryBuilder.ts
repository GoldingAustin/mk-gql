import { visit, print, Kind } from "graphql"
import gql from "graphql-tag"

export abstract class QueryBuilder {
  __query: string = ""

  public constructor() {
    this.__attr("__typename")
    if (typeof (this as any).id === "function") (this as any).id()
  }

  protected __attr(attr: string): this {
    return this._(attr)
  }

  // raw is exposed, to be able to add free form gql in the middle
  public _(str: string): this {
    this.__query += `${str}\n` // TODO: restore depth / formatting by passing base depth to constructor: ${"".padStart(this.__qb.stack.length * 2)}
    return this
  }

  protected __child<T extends QueryBuilder>(
    childName: string,
    childType: new () => T,
    builder?: string | ((q: T) => T) | T
  ): this {
    this._(`${childName} {\n`)
    this.__buildChild(childType, builder)
    this._(`}`)
    return this
  }

  // used for interfaces and unions
  protected __inlineFragment<T extends QueryBuilder>(
    childName: string,
    childType: new () => T,
    builder?: string | ((q: T) => T) | T
  ) {
    this._(`... on ${childName} {\n`)
    this.__buildChild(childType, builder)
    this._(`}`)
    return this
  }

  protected __buildChild<T extends QueryBuilder>(
    childType: new () => T,
    builder?: string | ((q: T) => T) | T
  ) {
    // already instantiated child builder
    if (builder instanceof QueryBuilder) {
      this._(builder.toString())
    } else {
      const childBuilder = new childType()
      if (typeof builder === "string") childBuilder._(builder)
      else if (typeof builder === "function") builder(childBuilder)
      // undefined is ok as well, no fields at all
      this._(childBuilder.toString())
    }
  }

  public toString(removeFields?: string[]) {
    if (this.__query) {
      const doc = gql`
      query {
        ${this.__query}
        }
      `
      const currentItems = new Map<string, Set<string>>()
      const newAst = visit(doc, {
        enter(node: any, key: any, parent: any, path: any, ancestor: any) {
          if (node.kind === Kind.FIELD) {
            const pathString = path.slice(0, path.length - 1).toString()
            const currentItem = currentItems.get(node.name.value)
            if (!currentItems.has(node.name.value))
              currentItems.set(node.name.value, new Set())
            if (
              (currentItem && currentItem.has(pathString)) ||
              (removeFields && removeFields.includes(node.name.value))
            ) {
              const currentItem = currentItems.get(node.name.value)
              if (currentItem) currentItem.add(pathString)
              return null
            }
            if (currentItem) currentItem.add(pathString)
            return node
          }
        }
      })
      const ast = print(newAst)
      return ast.trim().substr(1, ast.length - 3)
    }
    return ""
  }
}
