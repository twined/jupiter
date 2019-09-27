# Release Instructions

  1. git-flow: Start release. Tag without "v", e.g. 0.1.0 - NOT v0.1.0!
  2. Bump version in `CHANGELOG`
  3. Bump version in `package.json`
  4. yarn test
  5. yarn build
  6. Commit with `Prepare X.X.X release`
  7. git-flow: finish release. Tag without "v", e.g. 0.1.0 - NOT v0.1.0!
     - tag message: Release vX.X.X
  8. Switch to master. Push.
  9. Push `X.X.X` tag to `origin`
  10. Switch to develop-branch.
  11. npm publish --access=public
