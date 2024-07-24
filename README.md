# H-util-cli

Turns some common data operations into a CLI tool, to prevent needing various third party apps and utilities and configs. This includes:

- Prefixing image names by their creation date
- Tagging video metadata by their title (e.g. with YT downloader)
- Quickly compress some media files for storage
- Umu

## Prerequisites

Needs the `ffmpeg` tool installed to perform media type actions.

```bash
brew install ffmpeg
```

## Usage

This command will link and instantly invoke to test a successful installation:

```bash
npm run test-install
```

To link the command to be able to run it from terminal globally, run:

```bash
npm run update
h-util -o nihao
```

If already built and just needs installation:

```bash
npm run local
```

In some scenarios there may be a permissions error. [This link](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally) has provided useful as it may be an npm global installations issue.

To run in-place just use as follows. Note the `--` which indicates flags should be passed to the script and not consumed by npm/ts-node.

```bash
npm run ts-n -- umu
```

## Test

```bash
npm run test
```

# H-Util-UI

See README in `/h-util-ui` for the bootstrap template's setup instructions. Special directions (if any) will be added below if necessary.
