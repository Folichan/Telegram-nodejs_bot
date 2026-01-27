require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// CREATE BOT
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет, Октагон!');
});

// /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  const text = `
Список команд:
/site — ссылка на сайт Октагон;
/creator — создатель бота!
`;

  bot.sendMessage(chatId, text);
});

// /site
bot.onText(/\/site/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'https://octagon-students.ru/');
});

// /creator
bot.onText(/\/creator/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Бота создала Тарасова Ольга Сергеевна!');
});

console.log('Бот запущен.');