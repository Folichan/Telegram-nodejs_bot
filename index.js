require('dotenv').config();
const db = require('./db');
const TelegramBot = require('node-telegram-bot-api');
const QRCode = require('qrcode');
const puppeteer = require('puppeteer');

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
  { command: 'deleteitem', description: 'Удалить предмет по ID' },
  { command: 'qr', description: 'Получить QR текста'},
  { command: 'webscr', description: 'Скриншот из сайта по ссылке'}
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

//qr code
bot.onText(/\/qr (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];

  try {
    // создаём QR как buffer (картинка)
    const qrBuffer = await QRCode.toBuffer(text);

    // отправляем как фото
    await bot.sendPhoto(chatId, qrBuffer, {
      caption: 'QR-код:'
    });

  } catch (err) {
    bot.sendMessage(chatId, 'Ошибка при создании QR-кода...');
  }
});

//website screenshot
bot.onText(/\/webscr (https?:\/\/\S+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const url = match[1];

  let browser;

  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1280,
      height: 800
    });

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const screenshot = await page.screenshot({
      fullPage: true
    });

    await bot.sendPhoto(chatId, screenshot, {
      caption: `Скриншот сайта:\n${url}`
    });

  } catch (err) {
    bot.sendMessage(chatId, 'Ошибка при создании скриншота');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});


console.log('Бот запущен.');