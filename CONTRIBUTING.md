# Contributing

This project follows the [Angular](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines) & [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) commit message guidelines. All commits that fix a bug or add a feature **must** be marked with the feat/fix scope otherwise they may not trigger a release once merged.

Prettier and ESLint are also present here, please make sure your code is formatted correctly and up to the standards of this project before submitting a PR.

## Development

- `bun run build` - build the package
- `bun run test` - run the automated test suite
- `bun run smoke` - build the package, run real esbuild smoke builds, print
  plugin logs and generated declaration contents, and leave outputs under
  `tests/smoke/dist`
- `bun run lint` - typecheck, lint, and validate package metadata
- `bun run check` - run lint, tests, and smoke
