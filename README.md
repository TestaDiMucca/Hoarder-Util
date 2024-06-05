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

To link the command to be able to run it from terminal globally, run:

```bash
npm run update
h-util -o nihao
```

If already built and just needs installation:

```bash
npm run local
```

To run in-place just use as follows. Note the `--` which indicates flags should be passed to the script and not consumed by npm/ts-node.

```bash
npm run ts-n -- -o umu
```

## Test

```bash
npm run test
```
