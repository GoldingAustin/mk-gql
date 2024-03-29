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

  protected __buildChild<T extends QueryBuilder>(childType: new () => T, builder?: string | ((q: T) => T) | T) {
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

  public toString() {
    if (this.__query) return this.__query
    return ""
  }
}
