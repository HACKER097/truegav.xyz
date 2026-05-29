import { spawn } from "child_process"
import { watch } from "chokidar"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const postsDir = resolve(root, "public", "posts")

const PORT = process.env.PORT || "1313"

// start hugo server
const hugo = spawn("hugo", [
  "server",
  "--disableFastRender",
  "--port", PORT,
], {
  cwd: root,
  stdio: "inherit",
})

let debounceTimer
let ready = false
const changedFiles = new Set()

const runShiki = () => {
  const files = [...changedFiles]
  changedFiles.clear()
  if (files.length === 0) return

  // full scan or targeted files
  const isFull = files.length === 1 && files[0] === postsDir
  const args = isFull ? [] : files.map(f => f.replace(postsDir + "/", ""))
  const proc = spawn("node", [resolve(__dirname, "shikify.mjs"), ...args], {
    cwd: root,
    stdio: "inherit",
  })
  proc.on("exit", (code) => {
    if (code !== 0) console.error("Shiki exited with code", code)
  })
}

// wait for hugo's initial build, then do an initial shikify pass
setTimeout(() => {
  ready = true
  changedFiles.add(postsDir)
  runShiki()
}, 2000)

// watch public/posts for changes
const watcher = watch(postsDir + "/**/index.html", {
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 },
})

watcher.on("change", (path) => {
  if (!ready) return
  changedFiles.add(path)
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(runShiki, 300)
})

watcher.on("add", (path) => {
  if (!ready) return
  changedFiles.add(path)
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(runShiki, 300)
})

const cleanup = () => {
  watcher.close()
  hugo.kill()
  process.exit()
}

process.on("SIGINT", cleanup)
process.on("SIGTERM", cleanup)

hugo.on("exit", cleanup)

hugo.on("error", (err) => {
  if (err.code === "ENOENT") {
    console.error("hugo not found — install it first")
  }
  cleanup()
})

console.log(`Dev server: watching ${postsDir}`)
