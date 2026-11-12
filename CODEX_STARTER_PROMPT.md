# First Codex Prompt

Use this after opening the repository in Codex:

> Read `AGENTS.md`, `START_HERE.md`, `CURRENT_STATE.md`, `DEVELOPMENT_AND_RELEASE.md`, and `REGRESSION_CHECKLIST.md` completely. Then inspect the current Review Console v0.7.18 source under `source/review-console-v0.7.18/` without changing it.
>
> Confirm the baseline, summarize the architecture and protected behaviors, and identify the likely causes of the reported unacceptable latency while typing, entering data, and choosing projects. Diagnose only: trace input handlers, autosave/IndexedDB writes, full-screen re-renders, site switching, large JSON cloning/stringification, contact aggregation, and duplicate event listeners. Use browser profiling or temporary instrumentation in a separate working copy if needed, but do not produce a release or alter the baseline until the cause is demonstrated.
>
> Preserve Parser/Console separation, all import methods, Saved Sites, reports, Dropbox modes, Contacts/Departments, email routing/history, mobile behaviors, and inert panel backdrops. Parser Lite v0.8.16a is supplied as a separate client baseline; do not modify it during this Review Console diagnosis and never overwrite its production `server/` folder.

## Prompt for a later implementation turn

After Codex has demonstrated the performance cause and the user approves a repair:

> Build a narrow patch release from Review Console v0.7.18. Fix only the demonstrated performance cause without weakening autosave or data integrity. Add a focused regression/performance check, update version/cache/release notes consistently, run the full protected checklist, and produce a flat deployable ZIP plus a full source ZIP. Treat the result as a candidate until I test and accept it.
