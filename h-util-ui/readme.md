# H-Util UI

A UI version of H-util to support dragging and dropping files and pipeline building.

## Setup

Run `npm run setup`

(As a side note, project was bootstrapped with `yarn` but migrated into an npm workspace, which caused some funky incompatibilities)

## Development mode

You can start development mode by running. For more scripts you can review the script property in the package.json
```bash
npm run start
```
Run `npm run app:build` for production or you can run `npm run app:build:nightly` for nightly version.

when running `build commands` make sure to add github repository property on your package.json, and add your repository link as the value.

## Notes

- Bootstrapped with [this template](https://github.com/BroJenuel/vue-3-vite-electron-typescript)
- Using Quasar for components/UI
- Vue Material Icons reference can be found [here](https://pictogrammers.com/library/mdi/)
