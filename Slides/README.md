# Directory Slideshow

Anything with a modern browser becomes a digital pictureframe

Just connect to the host and let it run.

This exists to give the Pi-Hole Pi an additional purpose besides blocking mobile.aria.microsoft/whatever.

# Included Dependencies

- NoSleep.js (0.9.0)
- jQuery.min (3.4.1)
- Material Icons (3.0.1)

# .env

- `PORT`: The default port that the server will be listening to
- `SCAN_PATH`: The default root directory for the file scanner to run through

# Config JSON

Accepted keys:
- `exclude`: An arrayof directory names that if the file scanner encounters, will not scan
- `scanPath`: Override the .env scan path with this scan path. Kinda pointless huh

# Improvements

- Scanning and preserving shuffle is not a thing
- It's very memory intensive since the shuffle list is forwarded to the client
- Not really designed as a photo viewer as much as a passive slideshow, but was added to in that direction