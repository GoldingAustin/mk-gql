#!/usr/bin/env node
import arg from "arg"

import { buildSchema, graphqlSync, introspectionQuery } from "graphql"

import { getConfig, mergeConfigs } from "./config"

import path from "path"

import fs from "fs"

import child_process from "child_process"

import { generate, logUnexpectedFiles, writeFiles } from "./generate"

const definition = {
  "--outDir": String,
  "--roots": String,
  "--excludes": String,
  "--namingConvention": String,
  "--modelsOnly": Boolean,
  "--force": Boolean,
  "--separate": Boolean,
  "--dontRenameModels": Boolean,
  "--header": String,
  "--fieldOverrides": String
}

export interface MkGqlScaffoldInput {
  outDir?: string
  roots?: string[]
  excludes?: string[]
  modelsOnly?: boolean
  force?: boolean
  separate?: boolean
  dontRenameModels?: boolean
  namingConvention?: string
  header?: string
  fieldOverrides?: [string, string, string][]
}

function main() {
  let args, config

  try {
    args = arg(definition)
    config = getConfig()
  } catch (e) {
    console.error(
      "Example usage: mk-gql --outDir=src/models graphql-schema.json\n, valid options: " +
        Object.keys(definition).join(", ")
    )
    throw e
  }

  const { outDir, input, roots, excludes, modelsOnly, forceAll, namingConvention, header, fieldOverrides } =
    mergeConfigs(args, config)
  const separate = !!args["--separate"]

  console.log(path.basename(__filename) + " --outDir=" + outDir + " " + input)
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  let json
  if (input.startsWith("http:") || input.startsWith("https:")) {
    const tmpFile = "tmp_schema.json"
    const command = `${__dirname}/../../.bin/apollo client:download-schema --endpoint=${input} ${tmpFile} ${
      header ? `--header=${header}` : "" // the header options MUST be after the output 0_o
    }`
    child_process.execSync(command)
    json = JSON.parse(fs.readFileSync(tmpFile, "utf8"))
    fs.unlinkSync(tmpFile)
  } else if (input.endsWith(".json")) {
    json = JSON.parse(fs.readFileSync(input, "utf8"))
  } else if (input.endsWith(".graphql")) {
    // Tnx https://blog.apollographql.com/three-ways-to-represent-your-graphql-schema-a41f4175100d!
    const text = fs.readFileSync(input, "utf8")
    const schema = buildSchema(text)
    const res = graphqlSync(schema, introspectionQuery)
    if (res.data) json = res.data
    else {
      console.error("graphql parse error:\n\n" + JSON.stringify(res, null, 2))
      process.exit(1)
    }
  } else {
    console.error("Expected json, graphql or url as input parameter, got: " + input)
    process.exit(1)
  }

  console.log("Detected types: \n" + json.__schema.types.map((t) => `  - [${t.kind}] ${t.name}`).join("\n"))

  // console.log(JSON.stringify(json, null, 2))
  const files = generate(
    json.__schema,
    "ts",
    roots,
    excludes,
    new Date().toUTCString(),
    modelsOnly,
    namingConvention,
    fieldOverrides
  )
  writeFiles(outDir, files, "ts", forceAll, true, separate)
  logUnexpectedFiles(outDir, files)
}

main()
