# Issue Log

A record of some headache-inducing issues and what the fix ended up being.

## Filter regexp not recognizing - Aug 1

### Fix

When the string was passed from an html input the escape characters were not necessary.

```regexp
^\d{1,2}\D\d{1,2}\D\d{1,2}\D\d{1,2}\D\d{1,2}
```

## Messages not coming from client - Jul 29

### Encountered

Attempting to link up save user data

### Fix

Calling `invoke` on the channel should be handled with `handle` and calling `send` handled with `on`. Moreover, there are limits to the IPC serialization so it seems safer to send string data.

## Cannot resolve modules - Jul 29

### Encountered

```
[PACKARINO] Error: Cannot find module '@util/output'
[PACKARINO] Require stack:
[PACKARINO] - /Users/admin/Documents/GitHub/Hoarder-Util/h-util-ui/dist/Electron/operations/handler.js
```

### Searched

```
node not compiling alias
```

### Fix

Used module-alias

In run time, when configured in `package.json` it would hard bake the path into the TS source and not `dist/`, so dynamic construction in `main.ts` was implemented as such:

```ts
moduleAliases.addAliases({
    '@util': path.join(__dirname, 'util'),
    '@shared': path.join(__dirname, '../common'),
});
```

## Cannot find dateformat - Jul 28

### Encountered

After trying to mess with `tsconfig` to set up paths, running `yarn start` broke.

### Searched

```
Error: Cannot find module 'dateformat'
```

### Workaround

Installed dateformat directly into the ui project folder. Not ideal, but not worth investigating further at this time.

As a side note, encountered this while trying to run `yarn setup` to refresh the environment:

```
error quasar@2.16.6: The engine "yarn" is incompatible with this module. Expected version ">= 1.21.1".
error Found incompatible module
```

Worked around it instead of addressing, fed up with setup and config snags for the day.

## Quasar notify not working - Jul 28

### Searched

```
Vue quasar Notify not showing
```

### Fix

There is a bug with the import, necessary to import from the library path:

```ts
// import { Notify } from 'quasar';
import Notify from 'quasar/src/plugins/notify/Notify';
```

## Runtime logging issues - Jul 28

### Encountered

Making output class a common module and running.

### Fix

```ts
// import * as colors from 'colors/safe';
const colors = require('colors/safe');
```

## Compilation issues - Jul 27

### Encountered

Attempting to compile after adding date prefix module, to test functionality.

### Searched

```
require() of ES Module not supported dateformat
```

When attempting to build after adding dateformat module to `@common/`

### Fix

Add `"type": "commonjs"` to package json to enable importing these module types.

## Empty front-end - Jul 26

### Encountered

After attempting to hook up the client to the back-end processes via IPC.

### Searched

```
client import electron crashes __dirname
```

### Fix

Remove `electron-preload-helpers` and just use electron's native ipc renderer when trying to preload and expose an API.

## No main logs - Jul 26

### Encountered

Attempting to verify that the back-end processes are starting and logging, to be able to confirm if we are receiving messages.

### Searched

```
Electron main console logs not showing
```

### Fix

Reconfigure build locations and make sure the entry point was the correct built file.

Previous, it built in the `/dist` directory directly, but it got moved into `/dist/Electron` 
