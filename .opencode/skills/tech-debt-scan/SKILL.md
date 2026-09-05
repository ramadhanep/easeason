---
name: tech-debt-scan
description: Checklist and methodology for scanning a codebase for tech debt — dead code, unused dependencies, leftover TODOs, duplicated logic, over-engineering, oversized files, hardcoded values, doc drift, and test gaps. Use when the user asks to scan tech debt, audit code health, or find rot/legacy in the code. Read-only analysis, never edits.
---

# Tech Debt Scan

Run a read-only audit. Report findings; do not change code.

## Process

1. Map the repo: `package.json`, `tsconfig`, framework config (`nuxt.config.ts`), dirs.
2. Run the checks below with search tools. For each finding note exact `path:line`.
3. Collect into a categorized report (format at the bottom).

## Checks

### 1. Dead code
- Unused exports / imports / components / files. Verify a symbol: grep for every occurrence; if only its definition appears, it's dead.
- Unused files: no imports anywhere, not registered in config/routes.
- Dead branches: `if` guarded by a constant that never changes, commented-out blocks left in production code.
- Extra format: a `.vue` component, `server` util, or `shared/` type that nothing imports.

### 2. Unused / duplicate dependencies
- Compare `package.json` `dependencies` with actual imports in `app/`, `server/`, `shared/`, `tests/`.
- Flag direct `dependencies` that are only used transitively (list under devDependencies or delete).
- Flag two packages solving the same problem (e.g. duplicate UI renderers, two class-merge utils). Note: `clsx` + `tailwind-merge` via `cn()` is intentional.
- Flag beta/experimental pins that have a stable release.

### 3. Leftover markers
- Grep `TODO|FIXME|HACK|XXX|@ts-ignore|@ts-expect-error|ponytail:`. Categorize: stale (done, remove), real (tracked elsewhere?), or vague (write a real ticket).
- Grep `console.log|console.error` left in production code.

### 4. Duplication
- Same logic copied across files (formatters, date math, `Intl.NumberFormat`, win-rate/median computation). One correct shared helper beats three copies at `shared/seasonal.ts`.

### 5. Over-engineering
- Interface with exactly one implementation.
- Factory/registry/strategy layer for one product.
- Config knob for a value that never varies.
- Abstractions "for later". The repo's PRODUCT.md guardrails explicitly forbid these.

### 6. Oversized files
- Files over ~300 lines (excluding ui/ shadcn components). Note where script/template split would help, but stay lazy — only recommend if it genuinely hurts.

### 7. Hardcoded / magic values
- Magic numbers repeated across files (e.g. `MIN_DAYS`, TTL ms, `1971`, `[2016, 2017, ...]`).
- Live URLs / keys / tokens in source — report as security debt immediately.

### 8. Error handling & robustness
- Swallowed errors (empty `catch`, `catch {}`, unhandled promise rejections).
- Client fetches without fallback/error UI.
- Trust boundary: request params passed into external calls without validation (e.g. `symbol` into Yahoo Finance, `[symbol]` route param). Confirm whether the curated-list allowlist gates it.

### 9. Test gaps
- For each `server/utils/` and `shared/` module, check `tests/` for coverage: math, seasonal, stocks, markdown builder.
- Tests that assert nothing (`expect(true)`), or duplicate implementation verbatim.

### 10. Doc drift
- Compare `README.md` / `PRODUCT.md` claims against code: API contract shape, profile ids/labels, directory tree, feature list, dependencies.
- Compare `content.config.ts` fields vs `content/research/*.md` frontmatter used.

### 11. Cache / perf
- In-memory caches without TTL or that accumulate unbounded (Map never cleared).
- N+1 fetches in API handlers or repeated client-side requests.

## Severity
- **High**: data-loss risk, security, broken trust boundary, dead production path, stale API contract.
- **Med**: duplication, oversized files, missing error handling, unwired cache.
- **Low**: markers, unused cosmetics, doc nitpicks, style.

## Report format

```md
## Tech Debt Scan — <project>

Found: <n> (X high, Y med, Z low)

### High
- `path:line` — issue — suggested fix

### Med
...

### Low
...

### Summary
Biggest lever + one-sentence next step.
```

Never fix during a scan. Output the report only.