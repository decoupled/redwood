import fetch from "node-fetch"
export async function redwoodjs_get_latest_version(): Promise<
  string | undefined
> {
  const name = "@redwoodjs/core"
  const nn = encodeURIComponent(name)
  const url = "https://registry.npmjs.org/" + nn
  const dd = await (await fetch(url)).json()
  const latest = dd["dist-tags"].latest
  if (typeof latest === "string") return latest
}
