# Contributing to easeason

Thanks for wanting to contribute! easeason is a small open-source project, so every PR matters — bug fixes, new research articles, documentation, or chart/data improvements are all welcome.

This guide covers the common workflow. Keep it simple: fork, branch, commit, push, open a PR.

## Code of Conduct

Be respectful and constructive. This is a research tool; keep the tone professional and the scope focused.

## How to Open a Pull Request

### 1. Fork the repository

Click **Fork** on [github.com/ramadhanep/easeason](https://github.com/ramadhanep/easeason). Then clone your fork:

```bash
git clone git@github.com:<your-username>/easeason.git
cd easeason
npm install
```

### 2. Create a branch

Always work on a dedicated branch, not `main`:

```bash
git checkout -b my-change
```

Use a short, descriptive name, e.g. `fix-chart-tooltip` or `article-tsla-seasonality`.

### 3. Make your changes

- Write code that follows the existing style (TypeScript, Nuxt 3, Vue composition API).
- Run the dev server to sanity-check locally:

```bash
npm run dev
```

- Add or update tests under `tests/` if you touch the seasonal math or server logic:

```bash
npm test
```

- Make sure the production build still passes:

```bash
npm run build
```

### 4. Commit your changes

Write a clear, concise commit message that describes what you changed and why.

```bash
git add .
git commit -m "Fix: keep floating header on all screen sizes"
```

### 5. Push and open a Pull Request

```bash
git push -u origin my-change
```

Then on GitHub, open a PR from your branch to the `main` branch of the upstream repository. In the PR description, briefly explain:

- what you changed and why,
- how you tested it,
- any notes for the reviewer.

## What Kind of Contributions Are Welcome

- **Research articles** — add a `content/research/<symbol>-seasonality.md` Markdown file following the existing article format (see `aapl-seasonality.md`). It should reference an image in `public/img/` and include accurate data.
- **Bug fixes** — especially for the chart, seasonal math, or article rendering.
- **Data fixes** — the curated asset list lives in `server/data/`.
- **Documentation** — README, this file, or code comments.
- **UI/UX polish** — consistent with the existing glass-card, brand-color design language.

Before starting a larger feature, consider opening an issue first to discuss the approach.

## Style Notes

- Prefer the smallest change that works — no speculative abstractions.
- Use vanilla HTML/CSS and standard library features before reaching for a new dependency.
- Never add a new dependency if a few lines of code already in the codebase can do the job.
- No unrequested boilerplate or scaffolding.

## Testing

```bash
npm test        # run the vitest suite
npm run build   # verify production build
```

Run both before opening your PR.

## Questions?

Open an issue on GitHub if you are unsure about anything.
