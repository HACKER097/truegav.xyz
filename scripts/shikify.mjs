import { createHighlighter, createCssVariablesTheme } from "shiki"
import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs"
import { parse } from "node-html-parser"

const theme = createCssVariablesTheme({
  name: "slate-xp",
  variablePrefix: "--shiki-",
  fontStyle: true,
})

const posts = "public/posts"

// accept optional file paths from CLI args (for dev watcher)
const args = process.argv.slice(2)
let indexFiles
if (args.length > 0) {
  indexFiles = args.map(a => {
    // accept both relative and bare filenames
    const rel = a.replace(/^public\/posts\//, "").replace(/^posts\//, "")
    return rel.endsWith("index.html") ? rel : rel + "/index.html"
  }).filter(f => existsSync(posts + "/" + f))
} else {
  const files = readdirSync(posts, { recursive: true, encoding: "utf-8" })
  indexFiles = files.filter(f => f.endsWith("index.html") && f.includes("/") && !f.endsWith("index/index.html"))
}

if (indexFiles.length === 0) {
  console.log("Shiki: no files to process")
  process.exit(0)
}

const ALL_LANGS = [
  "javascript","typescript","python","go","rust","bash","nix","toml","json",
  "html","css","sql","yaml","markdown","c","cpp","java","ruby","lua","zig",
  "ini","sh","shell","powershell","dockerfile","makefile","diff",
  "jsx","tsx","svelte","vue","php","elixir","haskell","scala","kotlin",
  "swift","r","matlab","perl","groovy","latex","tex","asm","wasm",
]

const highlighter = await createHighlighter({
  themes: [theme],
  langs: ALL_LANGS,
})

let highlightedBlocks = 0

for (const file of indexFiles) {
  const path = posts + "/" + file
  try {
    const content = readFileSync(path, { encoding: "utf-8" })
    const dom = parse(content)
    const blocks = dom.querySelectorAll("pre")
    let fileChanged = false

    for (const block of blocks) {
      // skip already-processed blocks (have data-lang from previous shikify run)
      if (block.hasAttribute("data-lang")) continue

      const codeChild = block.childNodes[0]
      if (!codeChild) continue

      let lang = "text"
      const raw = codeChild.toString()
      if (raw.includes('class="language-')) {
        lang = raw.split("language-")[1].split('"')[0]
      }

      const code = parse(raw).textContent
      const langs = highlighter.getLoadedLanguages()
      const resolvedLang = langs.includes(lang) ? lang : "text"
      const highlighted = highlighter.codeToHtml(code, {
        lang: resolvedLang,
        theme: "slate-xp",
      })

      const parsed = parse(highlighted)
      const pre = parsed.querySelector('pre')
      if (pre) pre.setAttribute('data-lang', resolvedLang)
      block.replaceWith(parsed)
      highlightedBlocks++
      fileChanged = true
    }

    if (fileChanged) writeFileSync(path, dom.toString())
  } catch (err) {
    console.error(`Shiki: failed to process ${file}:`, err.message)
  }
}

console.log(`Shiki: highlighted ${highlightedBlocks} blocks across ${indexFiles.length} files`)
