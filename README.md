# AI Export Session

Chrome extension (Manifest V3). Exports a ChatGPT or Gemini conversation
to a single Markdown file shaped for Obsidian:

- YAML frontmatter (`title`, `model`, `created`, `url`, `source`, `tags`)
- One callout per message: `> [!question]` for you, `> [!note]` for the
  assistant
- Per-message timestamps when the site exposes them
- Filename: `YYYY-MM-DD <chat title>.md`

Supported sites:

- `chatgpt.com` / `chat.openai.com`
- `gemini.google.com`

## Install (unpacked)

1. Clone or download this repo.
2. Build the package (Node 18+, no npm deps):
   ```sh
   node build.mjs
   ```
   Works on Windows, Linux, and macOS. Linux/macOS need the `zip` CLI
   (`apt install zip` / `brew install zip`); Windows uses the built-in
   `Compress-Archive`.

   Output:
   - `dist/AI Export Session/` — unpacked extension folder
   - `dist/ai-export-session.zip` — zipped copy for sharing
3. Open `chrome://extensions`.
4. Toggle **Developer mode** (top right).
5. Click **Load unpacked** and pick `dist/AI Export Session/`.

Alternative: load `src/` directly with **Load unpacked** — no build step
needed for local dev.

## Use

1. Open a chat on ChatGPT or Gemini.
2. Click the extension icon → **Export session**.
3. Browser downloads the `.md` file. Drop it into your Obsidian vault.

Status line in the popup reports message count and filename, or an error
if the page isn't a supported chat.

## Layout

```
src/
  manifest.json         MV3 manifest, host + scripting permissions
  popup.html / popup.js Popup UI; injects exporters into the active tab
  exporters/
    shared.js           Frontmatter + callout formatter + download
    chatgpt.js          DOM scrape for ChatGPT
    gemini.js           DOM scrape for Gemini
build.mjs               Copies src/ → dist/ and zips it (Node, cross-platform)
.gitignore              Allowlist: only .gitignore, README.md, build.mjs, src/
```

## Permissions

- `scripting`, `activeTab` — inject the exporter on click only
- Host access limited to the two chat domains above

No background page, no network calls, no analytics. Conversation text
never leaves the browser.

## Notes

- Site DOM changes break exporters. If a scrape returns
  `No messages found.`, the selectors in `exporters/<site>.js` need an
  update.
- Timestamps come from whatever the site renders. ChatGPT exposes them
  per message; Gemini usually only has the session date.
