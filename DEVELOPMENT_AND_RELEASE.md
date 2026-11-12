# Development and Release Procedure

## One-time migration steps

1. Create a private Git repository.
2. Place this kit at the repository root.
3. Confirm the Review Console v0.7.18 source ZIP hash against `MANIFEST.sha256`.
4. Commit the kit unchanged as `SiteScribe migration baseline — Review Console v0.7.18`.
5. Commit the supplied Parser Lite v0.8.16a client files separately from the Review Console baseline. Exclude production keys and tokens.
6. Open the repository in Codex. Ensure Codex reads `AGENTS.md`, `START_HERE.md`, and `CURRENT_STATE.md` before changing code.

## Per-change workflow

1. Restate the requested behavior and identify the current accepted baseline.
2. Inspect the exact source path and trace the responsible handler/data path.
3. State the diagnosis before editing when the task is a bug repair.
4. Create one working-copy folder from the accepted baseline.
5. Make the smallest coherent edit.
6. Increment the version according to scope:
   - patch: repair or narrow UI behavior;
   - minor: meaningful compatible feature;
   - major: incompatible schema/architecture change, only with explicit approval.
7. Update visible version, JavaScript version constant, cache markers, release notes, and regression script together.
8. Run static and focused tests.
9. Run the manual protected-behavior checklist.
10. Package a flat deployable ZIP and a full source ZIP.
11. Keep the prior accepted ZIP as rollback.
12. The user deploys and tests. Only explicit user acceptance promotes the candidate to baseline.

## Review Console static checks

From the candidate source directory:

```bash
node --check app.js
node --check dropbox-sync-proof.js
node --check sitescribe-add-data.js
node --check sitescribe-hours-excel.js
node --check sitescribe-mds-excel.js
node --check sitescribe-parser-core.js
node regression_check_CURRENT_VERSION.js
```

Also inspect duplicate function declarations, duplicate HTML IDs, missing cached elements, CSS braces, and version/cache consistency.

## Review Console deployable contents

The current flat deployable contains these nine files:

```text
app.js
dropbox-callback.html
dropbox-callback.js
dropbox-sync-proof.js
exceljs.min.js
index.html
sitescribe-hours-excel.js
sitescribe-mds-excel.js
styles.css
```

Do not include regression scripts, release notes, handoffs, working folders, or secret configuration in the deployable ZIP.

## Parser Lite deployment rule

Routine Parser Lite releases update client files only. The supplied v0.8.16a client set contains `index.html`, `app.js`, `styles.css`, `sitescribe-parser-core.js`, and `sitescribe_contacts.json`. Deploy only the files changed by the release; do not replace the entire deployed folder. Do not overwrite `server/parse.php` or `server/sitescribe_openai_key.php` unless the user explicitly authorizes a proxy/server change.

## Rollback

- Keep the last user-accepted source and deployable ZIP unchanged.
- If a deployed candidate regresses, restore the complete accepted deployable rather than mixing files from versions.
- Clear or bump browser/PWA cache markers after restoration.
- Verify the displayed version and at least one protected import/export path after rollback.

## Secret handling

- Never commit OpenAI API keys, Dropbox access tokens, session tokens, or private credentials.
- A public Dropbox client app key may exist in browser code by design, but do not confuse it with a secret access token.
- Use an example or ignored local configuration for server secrets.
