const exampleAction = `  .actions(self => ({
    // this is just an auto-generated example action. 
    // Feel free to add your own actions, props, views etc to the model. 
    // Any code outside the '#region mst-gql-*'  regions will be preserved
    log() {
      console.log(JSON.stringify(self))
    }
  }))`

function generate(
  types,
  format = "js",
  roots = new Set(),
  excludes = new Set(),
  generationDate = "a long long time ago..."
) {
  const files = [] // [[name, contents]]
  const objectTypes = []

  let currentType = "<none>"

  generateTypes()
  generateRootStore()
  generateBarrelFile(files)

  function generateTypes() {
    types
      .filter(type => roots.size === 0 || roots.has(type.name))
      .filter(type => !excludes.has(type.name))
      .filter(type => !type.name.startsWith("__"))
      .filter(type => type.kind !== "SCALAR" && type.kind !== "INPUT_OBJECT")
      .forEach(type => {
        currentType = type.name
        console.log(`Generating type '${type.name}' (${type.kind})`)
        try {
          switch (type.kind) {
            case "OBJECT":
            case "INTERFACE":
              return handleObjectType(type)
            case "ENUM":
              return handleEnumType(type)
            default:
              throw new Error("Unhandled type: " + type.kind)
          }
        } finally {
          currentType = "<none>"
        }
      })
  }

  function handleEnumType(type) {
    const name = type.name

    const header = `\
/* This is a mst-sql generated file */
import { types } from "mobx-state-tree"`

    const contents = `\
/**
* ${name}${optPrefix("\n *\n * ", sanitizeComment(type.description))}
*/
const ${name} = types.enumeration("${name}", [
${type.enumValues
  .map(
    enumV =>
      `  "${enumV.name}",${optPrefix(
        " // ",
        sanitizeComment(enumV.description)
      )}`
  )
  .join("\n")}
])`

    const footer = `export { ${name} }`

    generateFile(name, [header, createSection("type-def", contents), footer])
  }

  function handleObjectType(type) {
    if (type.interfaces.length > 0)
      throw new Error("Interfaces are not implemented yet. PR welcome!")
    const name = type.name
    objectTypes.push(name)
    const imports = []

    let primitives = ["id", "__typename"]
    let refs = []

    const header = `\
/* This is a mst-sql generated file */
import { types } from "mobx-state-tree"
import { MSTGQLObject } from "mst-gql"`

    const contents = `
/**
* ${name}${optPrefix("\n *\n * ", sanitizeComment(type.description))}
*/
const ${name} = MSTGQLObject
  .named('${name}')
  .props({
${type.fields
  .filter(field => field.args.length === 0 && field.name !== "id")
  .map(field => handleField(field, imports))
  .join("\n")}
  })`

    const typeImports = unique(imports)
      // .map(i => `import { ${i}, ${toFirstLower(i)}FieldsDeep } from "./${i}"`)
      .map(i => `import { ${i} } from "./${i}"`)
      .join("\n")

    const flowerName = toFirstLower(name)

    const fragments = generateFragments()

    const footer = `export { ${name} }`

    generateFile(name, [
      header,
      createSection("type-imports", typeImports),
      createSection("fragments", fragments),
      createSection("type-def", contents),
      exampleAction,
      footer
    ])

    function handleField(field) {
      let r = ""
      if (field.description)
        r += `    /** ${sanitizeComment(field.description)} */\n`
      r += `    ${field.name}: ${handleFieldType(
        field.name,
        field.type,
        true
      )},`
      return r
    }

    function handleFieldType(fieldName, type, isRoot) {
      switch (type.kind) {
        case "SCALAR":
          primitives.push(fieldName)
          const primitiveType = primitiveToMstType(type.name)
          // a scalar as root, means it is optional!
          return !isRoot || primitiveType === "identifier"
            ? `types.${primitiveType}`
            : `types.optional(types.${primitiveType}, ${getMstDefaultValue(
                primitiveType
              )})`
        case "OBJECT":
          const isSelf = type.name === currentType
          refs.push([fieldName, type.name])

          const realType = `types.late(()${
            // always using late prevents potential circular dep issues
            isSelf && format === "ts" ? ": any" : ""
          } => ${type.name})`
          if (!isSelf) imports.push(type.name)
          return isRoot
            ? `types.maybe(types.reference(${realType}))`
            : `types.reference(${realType})`
        case "NON_NULL":
          return handleFieldType(fieldName, type.ofType, false)
        case "LIST":
          return `types.array(${handleFieldType(
            fieldName,
            type.ofType,
            false
          )})`
        default:
          throw new Error(
            `Failed to convert type ${JSON.stringify(type)}. PR Welcome!`
          )
      }
    }

    function generateFragments() {
      let fragments = `\
export const ${flowerName}Primitives = \`
${primitives.join("\n")}
\`
`

      //       if (refs.length === 0) {
      //         fragments += `\
      // export const ${flowerName}FieldsShallow = ${flowerName}Primitives
      // export const ${flowerName}FieldsDeep = ${flowerName}Primitives`
      //       } else {
      //         fragments += `\
      // export const ${flowerName}FieldsShallow = ${flowerName}Primitives + \`
      // ${refs.map(([fname]) => `${fname} { id __typename }`).join("\n")}
      // \`

      // export const ${flowerName}FieldsDeep = ${flowerName}Primitives + \`
      // ${refs
      //   .map(
      //     ([fname, type]) =>
      //       `${fname} { id, __typename` +
      //       (type === name ? `}` : ` \${${toFirstLower(type)}FieldsDeep} }`)
      //   )
      //   .join("\n")}
      // \``
      //       }
      return fragments
    }
  }

  function generateRootStore() {
    const header = `\
/* This is a mst-sql generated file */
import { types } from "mobx-state-tree"
import { MSTGQLStore } from "mst-gql"`

    const typeImports =
      objectTypes.length === 0
        ? ``
        : `import { ${objectTypes.join(", ")} } from "./index"`

    const contents = `\
/**
* Store, managing, among others, all the objects received through graphQL
*/
const RootStore = MSTGQLStore
.named("RootStore")
.props({
${objectTypes
  .map(t => `    ${t.toLowerCase()}s: types.optional(types.map(${t}), {})`) // TODO: optional should not be needed..
  .join(",\n")}
})
`
    const footer = `export { RootStore }`

    generateFile("RootStore", [
      header,
      createSection("type-imports", typeImports),
      createSection("type-def", contents),
      exampleAction,
      footer
    ])
  }

  function generateBarrelFile() {
    generateFile("index", [
      createSection("header", `/* mst-gql generated barrel file*/`),
      createSection(
        "exports",
        files.map(f => `export * from "./${f[0]}"`).join("\n")
      )
    ])
  }

  /**
   * When generating a file, only sections created through createSection are re-generated when the target file exists
   */
  function generateFile(name, sections) {
    files.push([name, sections])
  }

  return files
}

function primitiveToMstType(type) {
  const res = {
    ID: "identifier",
    Int: "integer",
    String: "string",
    Float: "number",
    Boolean: "boolean"
  }
  // if (!res[type]) throw new Error("Unknown primitive type: " + type)
  return res[type] || "frozen"
}

function getMstDefaultValue(type) {
  const res = {
    integer: "0",
    string: `''`,
    number: "0",
    boolean: "false",
    frozen: "undefined"
  }
  if (res[type] === undefined)
    throw new Error("Type cannot be optional: " + type)
  return res[type]
}

function createSection(name, contents) {
  return [name, contents]
}

function sanitizeComment(comment) {
  // TODO: probably also need to escape //, /*, */ etc...
  return comment ? comment.replace(/\n/g, " ") : ""
}

function optPrefix(prefix, thing) {
  if (!thing) return ""
  return prefix + thing
}

function unique(things) {
  return Array.from(new Set(things))
}

function toFirstLower(str) {
  return str[0].toLowerCase() + str.substr(1)
}

module.exports = { generate }
