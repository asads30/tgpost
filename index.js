const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql');
const axios = require('axios');
const token = '5842583011:AAExgCjsLtA1JB3c_AnppY46Sq1jR_ow7Qo';
const bot = new TelegramBot(token, {polling: true});
var https = require('https'),                                                
    Stream = require('stream').Transform,                                  
    fs = require('fs'); 
var con = mysql.createConnection({
    host: "localhost",
    database: "telegram",
    user: "root",
    password: "",
    charset: "utf8mb4_general_ci"
});
con.connect(function(err) {
    if (err) throw err;
});
let currentPost = 0;
bot.on('message', (msg) => {
    const chat_id = msg.chat.id;
    const first_name = msg.from.first_name;
    const user_id = msg.from.id;
    const txt1 = `😊 Привет, ${first_name}! Разреши представиться: я – полезный бот для админа. На меня уже подписано более 1 000 пользователей. И я рад видеть тебя среди них. 😉 Я умею:
    
📍 Создавать товары в твоем телеграм канале
📍 Принимать оплату прямо в Телеграм, если ты продаешь свои товары и услуги
    
Надеюсь, тебе интересно? Тогда добавляй свой канал, чтобы я смог стать и твоим помощником 🚀🚀🚀
    
/add_channel - добавить канал`;
    const txt2 = `☀️ Чтобы я смог сделать твой канал еще круче, тебе нужно выполнить несколько простых действий:

📍 Добавь @tgmbusinessbot в администраторы своего канала
📍 Перешли мне адрес (username) своего канала`;
    const txt3 = `🔥 Отлично, теперь все работает, как часы! Чем займемся? 😉

/add_product - Создать товар
/edit_channel - Изменить канал
/my_orders - Мои заказы
/payment - Вывод средств`;
    const txt4 = `☀️ Чтобы изменить канал, тебе нужно выполнить несколько простых действий:
            
📍 Добавь @tgmbusinessbot в администраторы своего канала
📍 Перешли мне адрес (username) своего канала`;
    const txt5 = `👌🏻 Давай разнообразим ассортимент твоих товаров!`;
    con.query(`SELECT * FROM users WHERE userid=${msg.from.id}`, function (err, result, fields) {
        const current_user = result[0];
        if(current_user?.id === undefined){
            con.query(`INSERT INTO users (userid, balance) VALUES (?, ?)`, [user_id, 0]);
            bot.sendMessage(chat_id, txt1);
        } else if(current_user?.channel === null){
            if(msg.text == '/add_channel'){
                con.query(`UPDATE users SET step = 1 WHERE userid = ${user_id}`);
                bot.sendMessage(chat_id, txt2);
            } else {
                if(current_user.step == 1){
                    let text = msg.text;
                    bot.getChatAdministrators(text).then(res => {
                        let isAdmin = false;
                        res.forEach(admins => {
                            if(admins.user.id == user_id){
                                isAdmin = true
                            }
                        });
                        if(isAdmin === true){
                            con.query(`UPDATE users SET step = ?, channel = ? WHERE userid = ${user_id}`, [0, text]);
                            axios.get(`https://api.telegram.org/bot${token}/getUpdates`);
                            bot.sendMessage(chat_id, txt3);
                        } else {
                            bot.sendMessage(chat_id, '😕 Извини, но я почему–то не вижу тебя среди админов этого канала. Отправь нам канал где ты являешся администратором или создателем');
                        }
                    }).catch(e => {
                        bot.sendMessage(chat_id, '😕 Неправильный формат канала. Отправь нам в формате: @channel');
                    })
                } else {
                    bot.sendMessage(chat_id, txt1);
                }
            }
        } else{
            if(msg.text == '/start'){
                bot.sendMessage(chat_id, txt3);
            } else if(msg.text == '/edit_channel') {
                con.query(`UPDATE users SET step = 1 WHERE userid = ${user_id}`);
                bot.sendMessage(chat_id, txt4);
            } else if(msg.text == '/add_product') {
                bot.sendMessage(chat_id, txt5, {
                    reply_markup: {
                        "inline_keyboard": [
                            [
                                {
                                    "text": "Начать добавление",
                                    "callback_data": "add_product"            
                                }
                            ]
                        ]
                    }
                });
            } else if(msg.text == '/payment') {
                bot.sendMessage(chat_id, `Ваш баланс: ${current_user?.balance}`, {
                    reply_markup: {
                        "inline_keyboard": [
                            [
                                {
                                    "text": "Вывести",
                                    "callback_data": "go_payment"            
                                }
                            ]
                        ]
                    }
                });
            } else if(msg.text == '/my_orders') {
                con.query(`SELECT * FROM payments WHERE author = ${user_id}`, function (err, result, fields) {
                    if(result[0]){
                        result.forEach(element => {
                            bot.sendMessage(chat_id, `Платеж №${element.id}, ID поста: ${element.postid}, Цена: ${element.amount/100}`)
                        });
                    } else {
                        bot.sendMessage(chat_id, 'Заказов нет')
                    }
                });
            } else{
                if(current_user.step == 1){
                    let text = msg.text;
                    bot.getChatAdministrators(text).then(res => {
                        let isAdmin = false;
                        res.forEach(admins => {
                            if(admins.user.id == user_id){
                                isAdmin = true
                            }
                        });
                        if(isAdmin === true){
                            con.query(`UPDATE users SET step = ?, channel = ? WHERE userid = ${user_id}`, [0, text]);
                            axios.get(`https://api.telegram.org/bot${token}/getUpdates`);
                            bot.sendMessage(chat_id, txt3);
                        } else {
                            bot.sendMessage(chat_id, '😕 Извини, но я почему–то не вижу тебя среди админов этого канала. Отправь нам канал где ты являешся администратором или создателем');
                        }
                    }).catch(e => {
                        bot.sendMessage(chat_id, '😕 Неправильный формат канала. Отправь нам в формате: @channel');
                    })
                } else if(current_user.step == 2) {
                    let text = msg.text;
                    con.query(`UPDATE posts SET title = ? WHERE id = ${currentPost}`, [text]);
                    con.query(`UPDATE users SET step = '2-2' WHERE userid = ${user_id}`);
                    bot.sendMessage(chat_id, 'Мне тоже нужна такая штука! 😉 А теперь расскажи о своем товаре подробней. Отправь мне описание, которое смогут прочитать клиенты. 😊 Не забудь: описание должно быть не более 255 символов');
                } else if(current_user.step == '2-2') {
                    let text = msg.text;
                    con.query(`UPDATE posts SET des = ? WHERE id = ${currentPost}`, [text]);
                    con.query(`UPDATE users SET step = '2-3' WHERE userid = ${user_id}`);
                    bot.sendMessage(chat_id, '👍🏻 Отлично! Может быть, добавим фото товара? Загрузи сюда одну самую лучшую фотографию!');
                } else if(current_user.step == '2-3') {
                    let file_id = msg.photo[2].file_id;
                    axios.get(`https://api.telegram.org/bot${token}/getFile?file_id=${file_id}`).then(res => {
                        let file_url = `https://api.telegram.org/file/bot${token}/${res.data.result.file_path}`;
                        con.query(`UPDATE posts SET image = ? WHERE id = ${currentPost}`, [file_id]);
                        https.request(file_url, function(response) {                                        
                            var data = new Stream();
                            response.on('data', function(chunk) {                                       
                              data.push(chunk);                                                         
                            });
                            response.on('end', function() {                                             
                              fs.writeFileSync(`./photo/${file_id}.png`, data.read());                               
                            });
                        }).end();
                        con.query(`UPDATE users SET step = '2-4' WHERE userid = ${user_id}`);
                        bot.sendMessage(chat_id, 'А теперь давай расскажем им, сколько это стоит. 👌🏻 Не забудь, что оплата принимается в рублях 😉');
                    });
                } else if(current_user.step == '2-4') {
                    let text = msg.text;
                    let content = `👉🏻 Посмотрим, что получилось? 

Нажми на кнопку "Предпросмотр" чтобы увидеть, как сообщение будет выглядеть в канале.

Если не хочешь тратить время - выбирай публикацию и на твоем канале будет опубликован товар 👌🏻`;
                    con.query(`UPDATE posts SET price = ? WHERE id = ${currentPost}`, [text]);
                    bot.sendMessage(chat_id, content, {
                        reply_markup: {
                            "inline_keyboard": [
                                [
                                    {
                                        "text": "Предпросмотр",
                                        "callback_data": "preview_product"            
                                    }
                                ],
                                [
                                    {
                                        "text": "Опубликовать",
                                        "callback_data": "push_product"            
                                    }
                                ]
                            ]
                        }
                    });
                } else if(current_user.step == '4') {
                    let text = msg.text;
                    con.query(`UPDATE users SET payment = ? WHERE userid = ${user_id}`, [text]);
                    bot.sendMessage(chat_id, `Номер карты сохранен`, {
                        reply_markup: {
                            "inline_keyboard": [
                                [
                                    {
                                        "text": "Вывести",
                                        "callback_data": "go_pay"            
                                    }
                                ]
                            ]
                        }
                    });
                }
                else {
                    bot.sendMessage(chat_id, txt3);
                }
            }
        }
    });
});

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const data = callbackQuery.data;
    const user_id = callbackQuery.from.id;
    const msg = callbackQuery.message;
    const opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
    };
    let text;
    con.query(`SELECT * FROM users WHERE userid=${user_id}`, function (err, result, fields) {
        const current_user = result[0];
        if(data === 'add_product'){
            con.query(`INSERT INTO posts (userid, channel) VALUES (?, ?)`, [user_id, current_user.channel], function(err, result, fields) {
                if(!err){
                    con.query(`UPDATE users SET step = 2 WHERE userid = ${user_id}`);
                    currentPost = result.insertId;
                }
            })
            text = 'Отправь мне название товара, который хочешь добавить';
            bot.editMessageText(text, opts);
        } else if (data === 'preview_product') {
            con.query(`UPDATE users SET step = 3 WHERE userid = ${user_id}`);
            con.query(`SELECT * FROM posts WHERE id=${currentPost}`, function (err, result, fields) {
                let post = result[0];
                let payload = currentPost;
                let token = '381764678:TEST:47026';
                let prices = [{
                    label: post?.title,
                    amount: 100 * post?.price
                }];
                let options = {
                    photo_url: 'https://wpaka.uz/photo/file_id.png',
                    photo_width: 800,
                    photo_height: 400
                }
                try {
                    bot.sendInvoice(opts.chat_id, post?.title, post?.des, payload, token, "pay", "RUB", prices, options);
                } catch (error) {
                    console.log(error);
                }
                bot.sendMessage(opts.chat_id, 'Опубликовать', {
                    reply_markup: {
                        "inline_keyboard": [
                            [
                                {
                                    "text": "Да!",
                                    "callback_data": "push_product"            
                                }
                            ]
                        ]
                    }
                });
            });
        } else if (data === 'push_product') {
            con.query(`UPDATE users SET step = 0 WHERE userid = ${user_id}`);
            con.query(`SELECT * FROM posts WHERE id=${currentPost}`, function (err, result, fields) {
                let post = result[0];
                let channel = post.channel;
                let payload = currentPost;
                let token = '381764678:TEST:47026';
                let prices = [{
                    label: post.title,
                    amount: 100 * post.price
                }]
                let options = {
                  photo_url: 'https://wpaka.uz/photo/file_id.png',
                  photo_width: 800,
                  photo_height: 400
                }
                bot.sendInvoice(channel, post.title, post.des, payload, token, "pay", "RUB", prices, options);
            });
            text = `✅Я все опубликовал: пост на канале с описанием товара и стоимостью только что вышел. 

Осталось только дождаться покупателей `;
            bot.editMessageText(text, opts);
        } else if (data === 'go_payment') {
            if(current_user?.balance > 100 && current_user?.payment != null){
                bot.sendMessage(opts.chat_id, `Ваш баланс: ${current_user?.balance}
  
  Номер карты: ${current_user?.payment}`, {
                    reply_markup: {
                        "inline_keyboard": [
                            [
                                {
                                    "text": "Подтверждаю!",
                                    "callback_data": "go_pay"            
                                }
                            ]
                        ]
                    }
                });
            } else if(current_user?.balance > 99 && current_user?.payment === null){
                bot.sendMessage(opts.chat_id, `Введите номер карты`);
                con.query(`UPDATE users SET step = 4 WHERE userid = ${user_id}`);
            } else if(current_user?.balance < 100){
                bot.sendMessage(opts.chat_id, `Баланс ниже 100 рублей`);
            }
        } else if (data === 'go_pay'){
            text = 'Заявка на вывод принята';
            con.query(`UPDATE users SET balance=0 WHERE userid = ${user_id}`);
            bot.editMessageText(text, opts);
        }
    });
});

bot.on('pre_checkout_query', function onCallbackQuery(callbackQuery){
    const postid = callbackQuery.invoice_payload;
    const amount = callbackQuery.total_amount;
    const user_id = callbackQuery.from.id;
    bot.answerPreCheckoutQuery(callbackQuery.id, true);
    con.query(`INSERT INTO payments (postid, amount, userid, status) VALUES (?, ?, ?, ?)`, [postid, amount, user_id, 0])
});

bot.on('successful_payment', function onCallbackQuery(callbackQuery){
  let postid = callbackQuery.successful_payment.invoice_payload;
  const amount = callbackQuery.successful_payment.total_amount / 100;
  con.query(`UPDATE payments SET status = 1 WHERE postid = ${callbackQuery.successful_payment.invoice_payload}`);
  bot.sendMessage('-1001889076042', `Поступил заказ №${callbackQuery.message_id};

от ${callbackQuery.from.first_name} (${callbackQuery.from.id})

Пост: ${callbackQuery.successful_payment.invoice_payload} (${amount} рублей)`);
  con.query(`SELECT * FROM posts WHERE id=${postid}`, function (err, result, fields) {
    const res = result[0];
    const amountPersent = amount*0.9;
    con.query(`UPDATE users SET balance=balance+${amountPersent} WHERE userid = ${res.userid}`);
    bot.sendMessage(res.userid, `Поступил заказ №${callbackQuery.message_id};

от ${callbackQuery.from.first_name} (${callbackQuery.from.id})
    
Пост: ${callbackQuery.successful_payment.invoice_payload} (${amount} рублей)`)
  });
});