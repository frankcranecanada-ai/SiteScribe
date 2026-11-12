# Parser Lite v0.8.16a Client Baseline

These files were supplied by the user on 2026-08-05 and identify the application as SiteScribe Parser Lite v0.8.16a.

Included client files:

- `index.html`
- `app.js`
- `styles.css`
- `sitescribe-parser-core.js`
- `sitescribe_contacts.json`

The JavaScript files passed `node --check` when the migration kit was assembled.

The app uses the production endpoint `server/parse.php`. The deployed proxy, `server/sitescribe_openai_key.php`, and production OpenAI API key are intentionally not included in this repository. Routine Parser releases must not overwrite the deployed `server/` folder.

No v0.8.16a release note or automated regression script was supplied. Before the first Parser change, inventory the current UI and run a manual smoke test covering intake, API progress, structured JSON recognition, review/edit/accept/reject, deliverable handling, and export to the current Review Console.
