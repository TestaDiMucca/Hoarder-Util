# H-Util packages

Share some common methods between projects so we don't need to re-create and maintain two copies of file operation logic.

Configured with [reference](https://earthly.dev/blog/setup-typescript-monorepo/#:~:text=The%20most%20popular%20monorepo%20build,a%20bunch%20of%20npm%20commands.)

## Usage

When updating make sure to run the build on the root level.

```bash
npm run build
```

This will update the packages for use in other projects.

## Extending

If new libraries are added unfortunately they will need to also be added to the `package.json` of the h-util-ui, since the electron builder cannot currently supported dependencies from npm workspaces.

## Improvements

Files were simply moved into their respective directories, meaning they each still individually manage their own packages and scripts. So running the following for root directory `node_modules` may be an eventual goal but is not currently.

```bash
npm install moment --workspace ./packages/ui
```
