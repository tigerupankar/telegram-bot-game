# Telegram bot minimal example (Python, aiogram)
# Save this as bot.py. To run locally:
# 1) pip install aiogram aiohttp
# 2) export/SET TG_BOT_TOKEN="your_token_here"
# 3) python bot.py
#
# This script serves as an example that sends a Web App button which opens the game URL.
# It does NOT include secure verification of WebApp initData; for production you must
# validate initData using your bot token and Telegram docs.

import os
import logging
from aiogram import Bot, Dispatcher, types, executor

API_TOKEN = os.getenv("TG_BOT_TOKEN")
if not API_TOKEN:
    raise Exception("Set TG_BOT_TOKEN environment variable")

WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-game-hosting.example.com/")  # Replace with your hosted game URL

logging.basicConfig(level=logging.INFO)
bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

@dp.message_handler(commands=["start","play"])
async def cmd_start(message: types.Message):
    keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True)
    keyboard.add(types.KeyboardButton(text="▶️ Play Game", web_app=types.WebAppInfo(url=WEBAPP_URL)))
    await message.answer("Tap Play to open the game:", reply_markup=keyboard)

# Endpoint example: use your server to receive score posts from the WebApp
# For simplicity, we won't implement a web server in this file, but below is a sample webhook-like handler structure.
# You can use frameworks like FastAPI / Flask / aiohttp to receive /session/score POST calls from the WebApp.

if __name__ == "__main__":
    executor.start_polling(dp)
