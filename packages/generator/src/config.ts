import { resolve } from "path"

import { cosmiconfigSync } from "cosmiconfig"


const explorer = cosmiconfigSync("mk-gql")

export const defaultConfig = {
  excludes: [],
  force: false,
  format: "ts",
  input: "graphql-schema.json",
  modelsOnly: false,
  outDir: "src/models",
  roots: [],
  namingConvention: "js", // supported option: "js", "asis",
  header: undefined,
  fieldOverrides: []
}

export function getConfig() {
  try {
    const result = explorer.search()
    return result ? result.config : exports.defaultConfig
  } catch (e) {
    console.error((e as Error).message)
    return exports.defaultConfig
  }
}

export function mergeConfigs(args, config) {
  const headerConfigValues =
    config && config.header
      ? Object.keys(config.header)
          .map((key) => `${key}:${config.header[key]}`)
          .join(" --header=")
      : undefined

  return {
    format: "ts",
    outDir: resolve(process.cwd(), args["--outDir"] || config.outDir),
    input: args._[0] || config.input,
    roots: args["--roots"]
      ? args["--roots"].split(",").map((s) => s.trim())
      : config.roots,
    excludes: args["--excludes"]
      ? args["--excludes"].split(",").map((s) => s.trim())
      : config.excludes,
    modelsOnly: !!args["--modelsOnly"] || config.modelsOnly,
    forceAll: !!args["--force"] || config.force,
    namingConvention: args["--dontRenameModels"]
      ? "asis"
      : config.namingConvention,
    header: args["--header"] || headerConfigValues, // if multiple headers are passed in config, chain them up to pass on to apollo cli
    fieldOverrides: args["--fieldOverrides"]
      ? parseFieldOverrides(args["--fieldOverrides"])
      : config.fieldOverrides
  }
}

const parseFieldOverrides = (fieldOverrides) => {
  return fieldOverrides
    .split(",")
    .map((s) => s.trim())
    .map((item) => {
      const override = item.split(":").map((s) => s.trim())

      if (override.length !== 3)
        throw new Error("--fieldOverrides used with invalid override: " + item)

      return override
    })
}
