# Directory Slideshow

Anything with a modern browser becomes a digital pictureframe

Just connect to the host and let it run.

This exists to give the Pi-Hole Pi an additional purpose besides blocking mobile.aria.microsoft/whatever.

# .env

- `PORT`: The default port that the server will be listening to
- `SCAN_PATH`: The default root directory for the file scanner to run through

# Config JSON

Accepted keys:
- `exclude`: An arrayof directory names that if the file scanner encounters, will not scan
- `scanPath`: Override the .env scan path with this scan path. Kinda pointless huh