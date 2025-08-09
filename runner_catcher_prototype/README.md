
# Runner Catcher — HTML5 Telegram WebApp (Free prototype)

This is a zero-cost HTML5 prototype of a Subway-Surfers-like endless runner with a simple "catch creature" mechanic, ready to be opened inside Telegram as a Web App.

## What's included
- `index.html` — game page and Telegram WebApp init.
- `styles.css` — styling for layout and mobile controls.
- `game.js` — core game logic (canvas-based runner, spawn, catch, score).
- `bot.py` — minimal Telegram bot example (aiogram) that sends a Play button.
- `README.md` — this file.

## How to host for free (quick)
Option A — GitHub Pages (recommended)
1. Create a free GitHub account if you don't have one.
2. Create a new repository (public) and upload the files from this package (index.html, styles.css, game.js).
3. In repo Settings -> Pages, choose branch `main` and folder `/ (root)` to serve.
4. GitHub will give you a URL like `https://yourusername.github.io/repo-name/` — that's your `WEBAPP_URL`.

Option B — itch.io
1. Create a free itch.io account and upload `index.html` as a new HTML project (follow itch.io upload steps).
2. Itch will provide a public URL you can use as `WEBAPP_URL` in the bot.

## How to connect the bot
1. Create bot token:
   - Open Telegram -> @BotFather -> /newbot -> follow steps -> copy token.
2. Set environment variables and run the bot locally:
   - Linux/macOS: `export TG_BOT_TOKEN="123:ABC"` and `export WEBAPP_URL="https://.../index.html"`
   - Windows (cmd): `set TG_BOT_TOKEN=123:ABC` etc.
3. Install python deps: `pip install aiogram aiohttp` (aiohttp only if you add server endpoints)
4. Run: `python bot.py`
5. In Telegram, message your bot `/start` and press the Play button.

## How scoring works
- Double-click the game canvas to submit score to `/session/score` on the same host (you'll need to implement that server route to accept POSTs).
- The example `bot.py` does not implement the server; it's there to show how to send the Web App button.

## Customization ideas (easy)
- Replace player color or creature shapes in `game.js` for different looks.
- Edit spawn rates and chances for rarer creatures.
- Add images (place in repo and draw them on canvas) — see comments in `game.js`.

## Next steps I can help with (free)
- Help you upload to GitHub Pages and set the correct `WEBAPP_URL`.
- Add a simple backend (free) to accept scores and show a leaderboard.
- Make the game graphics prettier by replacing shapes with free sprite images.

Good luck! If you want, tell me when you've got a GitHub account and I'll guide you step-by-step to publish it live.
