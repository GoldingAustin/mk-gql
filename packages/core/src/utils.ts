export function getFirstValue(data: any) {
  const keys = Object.keys(data)
  if (keys.length !== 1) throw new Error(`Expected exactly one response key, got: ${keys.join(", ")}`)
  return data[keys[0]]
}

export function typenameToCollectionName(typename: string) {
  return typename[typename.length - 1].toLowerCase() === "s" ? typename.toLowerCase() : typename.toLowerCase() + "s"
}
