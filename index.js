require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// CREATE BOT
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// /start REPLY
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет, Октагон!');
});

console.log('Бот запущен.');
