import { visit, print, Kind } from "graphql"
import gql from "graphql-tag"

/**
 * @constructor
 * @this QueryBuilder
 */
function QueryBuilder(this: any) {}

QueryBuilder.prototype.__query = ""

QueryBuilder.prototype.__attr = function (attr: string) {
  return this._(attr)
}

// raw is exposed, to be able to add free form gql in the middle
QueryBuilder.prototype._ = function (str: string) {
  this.__query += `${str}\n`
  return this
}

QueryBuilder.prototype.__child = function (
  childName: string,
  ChildType: any,
  builder?: string | ((q: any) => any) | any
) {
  if (ChildType && this.__attr("__typename") !== childName) {
    this._(`${childName} {\n`)
    this.__buildChild(ChildType, builder)
    this._(`}`)
  }
  return this
}

// used for interfaces and unions
QueryBuilder.prototype.__inlineFragment = function (
  childName: string,
  ChildType: any,
  builder?: string | ((q: any) => any) | any
) {
  this._(`... on ${childName} {\n`)
  this.__buildChild(ChildType, builder)
  this._(`}`)
  return this
}

QueryBuilder.prototype.__buildChild = function (
  childBuilder: any,
  builder?: string | ((q: any) => any) | any
) {
  // already instantiated child builder
  if (builder instanceof QueryBuilder) {
    this._(builder.toString())
  } else {
    if (childBuilder) {
      if (typeof builder === "string") childBuilder._(builder)
      else if (typeof builder === "function") builder(childBuilder)
      // undefined is ok as well, no fields at all
      this._(childBuilder.toString())
    }
  }
}

QueryBuilder.prototype.toString = function (removeFields?: string[]) {
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
          if (!currentItems.has(node.name.value))
            currentItems.set(node.name.value, new Set())
          if (
            currentItems.get(node.name.value)?.has(pathString) ||
            removeFields?.includes(node.name.value)
          ) {
            currentItems.get(node.name.value)?.add(pathString)
            return null
          }
          currentItems.get(node.name.value)?.add(pathString)
          return node
        }
      }
    })
    const ast = print(newAst)
    return ast.trim().substr(1, ast.length - 3)
  }
  return ""
}

export { QueryBuilder }
