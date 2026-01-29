require('dotenv').config();
const db = require('./db');
const TelegramBot = require('node-telegram-bot-api');

// CREATE BOT
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет, Октагон!');
});

bot.setMyCommands([
  { command: 'help', description: 'Список команд' },
  { command: 'site', description: 'Сайт Октагона' },
  { command: 'creator', description: 'Создатель бота' },
  { command: 'randomitem', description: 'Случайный предмет' },
  { command: 'getitembyid', description: 'Получить предмет по ID' },
  { command: 'deleteitem', description: 'Удалить предмет по ID' }
]);


// /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  const text = `
Список команд:
/site — ссылка на сайт Октагон;
/creator — создатель бота!
/randomitem — случайный предмет;
/getitembyid — получение предмета по ID;
/deleteitem — удаление предмета по ID.
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

// /randomitem
bot.onText(/\/randomitem/, (msg) => {
  const chatId = msg.chat.id;

  const sql = `
    SELECT id, name, \`desc\`
    FROM items
    ORDER BY RAND()
    LIMIT 1
  `;

  db.query(sql, (err, results) => {
    if (err || results.length === 0) {
      bot.sendMessage(chatId, 'Ошибка...');
      return;
    }

    const item = results[0];
    bot.sendMessage(
      chatId,
      `(${item.id}) - ${item.name}: ${item.desc}`
    );
  });
});

// /getitembyid N
bot.onText(/\/getitembyid (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const id = match[1];

  const sql = 'SELECT id, name, `desc` FROM items WHERE id = ?';

  db.query(sql, [id], (err, results) => {
    if (err || results.length === 0) {
      bot.sendMessage(chatId, 'Ошибка...');
      return;
    }

    const item = results[0];
    bot.sendMessage(
      chatId,
      `(${item.id}) - ${item.name}: ${item.desc}`
    );
  });
});

//deleteitem N
bot.onText(/\/deleteitem (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const id = match[1];

  const sql = 'DELETE FROM items WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      bot.sendMessage(chatId, 'Ошибка...');
      return;
    }

    if (result.affectedRows === 0) {
      bot.sendMessage(chatId, 'Ошибка...');
    } else {
      bot.sendMessage(chatId, 'Удалено.');
    }
  });
});


console.log('Бот запущен.');