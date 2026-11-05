# Reviewing the prototype

## Open in VS Code

Open `zen-mahjong-prototype.code-workspace` from Finder or use VS Code's **File > Open Workspace from File** command. The workspace recommends the formatter, linter, React Native, and test extensions.

## Suggested review order

1. `docs/ASSUMPTIONS.md`
2. `docs/OPEN-QUESTIONS.md`
3. `packages/game-engine/src`
4. `packages/persistence/src`
5. `packages/ui/src` and `packages/mahjong-ui/src`
6. `apps/mobile/src/app`

## Verification

Run the VS Code task **Prototype: Verify** or:

```sh
pnpm verify
```

The command checks TypeScript, linting, tests, and formatting. Review product behavior separately against `docs/ACCEPTANCE-CRITERIA.md` because assumptions are not confirmation.
