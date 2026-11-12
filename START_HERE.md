# SiteScribe Codex Migration Kit

Status date: 2026-08-05

This folder is the starting point for continuing SiteScribe development in Codex. Read the files in this order:

1. `AGENTS.md` — binding project rules for Codex.
2. `CURRENT_STATE.md` — current baselines, completed features, pending decisions, and the next defect to investigate.
3. `DEVELOPMENT_AND_RELEASE.md` — safe edit, test, version, package, deploy, and rollback procedure.
4. `REGRESSION_CHECKLIST.md` — protected behavior that must survive every release.
5. `source/review-console-v0.7.18/` — current Review Console source baseline.
6. `docs/historical/10-SiteScribe_Agent_Work_Engineering_Handoff_v1.0_2026-07-13-1-.docx` — detailed architecture and regression history. It is historical context; where it conflicts with `CURRENT_STATE.md`, the latter wins.

## Baseline declaration

- Review Console: **v0.7.18**, user-tested lineage and current source baseline.
- Parser Lite client: **v0.8.16a**, supplied and syntax-checked. The production server proxy and secret-key file are intentionally not included.
- Shared contract: two-level SiteScribe JSON with preserved `sourceText`.

Do not build a new release from an older handoff or ZIP. The Parser Lite and Review Console both use `sitescribe-parser-core.js`; keep each component's complete tested file set together and do not substitute files across component folders.

## What the user needs to do

1. Create a private Git repository named `sitescribe`.
2. Extract this migration kit into the repository root.
3. Keep the supplied Parser Lite v0.8.16a client files together under `source/parser-lite-v0.8.16a/`. Do not add a production API key or copy the live parser `server/` folder into Git.
4. Commit the untouched baselines before asking Codex to change code.
5. Open the repository in Codex and use the starter prompt in `CODEX_STARTER_PROMPT.md`.
6. Ask Codex to inspect and diagnose before editing. The first recommended task is the reported typing/project-selection latency in Review Console v0.7.18.
7. Test each candidate locally and on iPhone before accepting it as the new baseline.

## Repository shape

```text
sitescribe/
  AGENTS.md
  START_HERE.md
  CURRENT_STATE.md
  DEVELOPMENT_AND_RELEASE.md
  REGRESSION_CHECKLIST.md
  CODEX_STARTER_PROMPT.md
  source/
    review-console-v0.7.18/
    parser-lite-v0.8.16a/
  artifacts/
    Review Console v0.7.18 source and deployable ZIPs
  docs/
    historical/
```

## Important working rule

Keep one clearly named active working directory and keep accepted releases as immutable archives. A generated ZIP is only a candidate until the user tests it and explicitly confirms it works.
