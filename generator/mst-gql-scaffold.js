#!/usr/bin/env node
const arg = require("arg")
const path = require("path")
const fs = require("fs")
const child_process = require("child_process")

const generationDate = new Date().toUTCString()

let args, format, outDir, input

try {
  args = arg({
    "--format": String,
    "--outDir": String
  })
} catch (e) {
  console.error(
    "Usage: mstgql-scaffold --format=js|ts --outDir=src/models graphql-schema.json"
  )
  throw e
}

function main() {
  format = args["--format"] || "js"
  outDir = path.resolve(process.cwd(), args["--outDir"] || "src/models")
  input = args._[0] || "graphql-schema.json"

  console.log(
    path.basename(__filename) +
      " --format=" +
      format +
      " --outDir=" +
      outDir +
      " " +
      input
  )
  if (!/^(ts|js)$/.test(format)) {
    console.error("Invalid format parameter, expected 'js' or 'ts'")
    process.exit(1)
  }
  if (!fs.existsSync(outDir) || !fs.lstatSync(outDir).isDirectory()) {
    console.error("outDir specified is not an existing directory")
    process.exit(1)
  }

  let json = ""
  if (input.startsWith("http:") || input.startsWith("https:")) {
    const tmpFile = "tmp_schema.json"
    child_process.execSync(
      `${__dirname}/../node_modules/.bin/apollo schema:download --endpoint=${input} ${tmpFile}`
    )
    json = JSON.parse(fs.readFileSync(tmpFile, "utf8"))
    // fs.unlinkSync(tmpFile) TODO: restore
  } else {
    json = JSON.parse(fs.readFileSync(input, "utf8"))
  }

  const types = json.__schema.types
  const files = []

  types
    .filter(type => !type.name.startsWith("__"))
    .forEach(type => {
      switch (type.kind) {
        case "OBJECT":
        case "INTERFACE":
          return handleObjectType(outDir, format, type, files)
        case "ENUM":
          return handleEnumType(outDir, format, type, files)
        case "UNION":
          return handleUnionType(outDir, format, type, files)
      }
    })

  // TODO: generateRootStore()
  generateBarrelFile(files)
}

function handleEnumType(outDir, format, type, files) {
  const name = type.name
  files.push(name)

  let contents = `\
/**
 * ${name}${optPrefix("\n *\n * ", sanitizeComment(type.description))}
 */`

  contents += `\nconst ${name} = types.enumeration("${name}", [\n`

  contents += type.enumValues
    .map(
      enumV =>
        `  "${enumV.name}",${optPrefix(
          " // ",
          sanitizeComment(enumV.description)
        )}`
    )
    .join("\n")

  contents += "\n])"

  let header = `\
/* This is a mst-sql generated file */
import { types } from "mobx-state-tree"`

  footer = `export { ${name} }`

  writeFile(name, [header, createSection("type-def", contents), footer])
}

function handleObjectType(outDir, format, type, files) {
  const name = type.name
  files.push(name)
  const imports = []

  let contents = `
/**
 * ${name}${optPrefix("\n *\n * ", sanitizeComment(type.description))}
 */`

  contents += `\nconst ${name} = MSTGQLObject\n  .named('${name}')\n  .props({\n`

  contents += type.fields
    .filter(field => field.args.length === 0)
    .map(field => handleField(field, imports, name))
    .join("\n")

  contents += "\n  })"

  const header = `\
/* This is a mst-sql generated file */
import { types } from "mobx-state-tree"
import { MSTGQLObject } from "mst-gql"`

  const typeImports = `import { ${Array.from(new Set(imports)).join(
    ", "
  )} } from "./index"`

  const footer = `export { ${name} }`

  writeFile(name, [
    header,
    createSection("type-imports", typeImports),
    createSection("type-def", contents),
    exampleAction,
    footer
  ])
}

function handleField(field, imports, self) {
  let r = ""
  if (field.description)
    r += `    /** ${sanitizeComment(field.description)} */\n`
  r += `    ${field.name}: ${handleFieldType(field.type, imports, true, self)},`
  return r
}

function handleFieldType(type, imports, root, self) {
  switch (type.kind) {
    case "SCALAR":
      const primitiveType = primitiveToMstType(type.name)
      // a scalar as root, means it is optional!
      return !root || primitiveType === "identifier"
        ? `types.${primitiveType}`
        : `types.optional(types.${primitiveType}, ${getMstDefaultValue(
            primitiveType
          )})`
    case "OBJECT":
      const isSelf = type.name === self
      const realType = isSelf
        ? `types.late(()${format === "ts" ? ": any" : ""} => ${type.name})`
        : type.name
      if (!isSelf) imports.push(type.name)
      return root
        ? `types.maybe(types.reference(${realType}))`
        : `types.reference(${realType})`
    case "NON_NULL":
      return handleFieldType(type.ofType, imports, false, self)
    case "LIST":
      return `types.array(${handleFieldType(
        type.ofType,
        imports,
        false,
        self
      )})`
    default:
      throw new Error(
        `Failed to convert type ${JSON.stringify(type)}. PR Welcome!`
      )
  }
}

function primitiveToMstType(type) {
  const res = {
    ID: "identifier",
    Int: "integer",
    String: "string",
    Float: "number",
    Boolean: "boolean"
  }
  if (!res[type]) throw new Error("Unknown primitive type: " + type)
  return res[type]
}

function getMstDefaultValue(type) {
  const res = {
    integer: 0,
    string: `''`,
    number: 0,
    boolean: false
  }
  if (res[type] === undefined)
    throw new Error("Type cannot be optional: " + type)
  return res[type]
}

function generateBarrelFile(files) {
  writeFile("index", [
    createSection(
      "header",
      `/* mst-gql generated barrel file ${generationDate} */`
    ),
    createSection(
      "exports",
      files.map(f => `export * from "./${f}"`).join("\n")
    )
  ])
}

function writeFile(name, sections) {
  const fnName = path.resolve(outDir, name + "." + format)
  if (!fs.existsSync(fnName)) {
    console.log("Generating " + fnName)
    const all = sections
      .map(section =>
        Array.isArray(section)
          ? `/* #region ${section[0]} */\n${section[1]}\n/* #endregion */`
          : "" + section
      )
      .join("\n\n")
    fs.writeFileSync(fnName, all)
  } else {
    console.log("Updating " + fnName)
    let contents = fs.readFileSync(fnName, "utf8")
    sections
      .filter(s => Array.isArray(s))
      .forEach(([name, text]) => {
        contents = replaceSection(contents, name, text, fnName)
      })
    fs.writeFileSync(fnName, contents)
  }
}

function replaceSection(contents, name, text, fnName) {
  const startString = `/* #region mst-gql-${name} */`
  const start = contents.indexOf(startString)
  if (start === -1)
    throw new Error(
      `Failed to update file: ${fnName}, couldn't find the start of region ${name}. Consider throwing the file away`
    )
  const endString = `/* #endregion */`
  const end = contents.indexOf(endString, start)
  if (end === -1)
    throw new Error(
      `Failed to update file: ${fnName}, couldn't find the end of region ${name}. Consider throwing the file away`
    )
  const tail = contents.substring(end - 1)
  const head = contents.substring(0, start + startString.length + 1)
  return head + text + tail
}

const exampleAction = `  .actions(self => ({
    // this is just an auto-generated example action. 
    // Feel free to add your own actions, props, views etc to the model. 
    // Any code outside the '#region mst-gql-*'  regions will be preserved
    log() {
      console.log(JSON.stringify(self))
    }
  }))`

main()

function sanitizeComment(comment) {
  // TODO: probably also need to escape //, /*, */ etc...
  return comment.replace(/\n/g, " ")
}

function optPrefix(prefix, thing) {
  if (!thing) return ""
  return prefix + thing
}

function createSection(name, contents) {
  return [name, contents]
}
