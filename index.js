const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql');
const axios = require('axios');
const token = '5871162291:AAHMk8JxaUZ2rAMVWarQ26u0U0SaWk-pHSs';
const bot = new TelegramBot(token, {polling: true});
var https = require('https'),                                                
    Stream = require('stream').Transform,                                  
    fs = require('fs'); 
var con = mysql.createConnection({
    host: "localhost",
    database: "telegram",
    user: "root",
    password: ""
});
con.connect(function(err) {
    if (err) throw err;
});
let currentPost = 79;
bot.on('message', (msg) => {
    const user_id = msg.from.id;
    const chat_id = msg.chat.id;
    const first_name = msg.from.first_name;
    const text1 = `Привет, ${first_name}. Каждый день я помогаю администраторам 650 000 телеграмм каналов создавать красивые посты с реакциями и комментариями, организую контент планы, платные подписки на приватные каналы и многое другое. 

/add_channel - Добавить канал`;
    const text2 = `Привет, ${msg.from.first_name}. Каждый день я помогаю администраторам 650 000 телеграмм каналов создавать красивые посты с реакциями и комментариями, организую контент планы, платные подписки на приватные каналы и многое другое. 

/add_product - Создать товар
/edit_channel - Изменить канал
/payment - Выплата
/my_orders - Оплаченные заказы`;
    const text3 = `Добавление канала

Чтобы добавить канал, вы должны выполнить два следующих шага:
    
1. Добавьте @tgpostmoneybot в администраторы вашего канала.
2. Перешлите мне @username вашего канала`;
    const text4 = `Ошибка - вы не добавили канал

Чтобы добавить канал, вы должны выполнить два следующих шага:
        
1. Добавьте @tgpostmoneybot в администраторы вашего канала.
2. Перешлите мне @username вашего канала`;
    const text5 = `Ошибка - бот не является администратором

Чтобы добавить канал, вы должны выполнить два следующих шага:
        
1. Добавьте @tgpostmoneybot в администраторы вашего канала.
2. Перешлите мне @username вашего канала`;
    const text6 = `Канал успешно добавлен.

Теперь ты можешь:

/add_product - Создать пост
/edit_channel - Изменить канал
/payment - Выплата`;
    const text7 = `Вы не являетесь администратором канала, добавьте свой канал

Чтобы добавить канал, вы должны выполнить два следующих шага:
        
1. Добавьте @tgpostmoneybot в администраторы вашего канала.
2. Перешлите мне @username вашего канала`;
    const text8 = `Изменение канала

Чтобы изменить канал, вы должны выполнить два следующих шага:
        
1. Добавьте @tgpostmoneybot в администраторы вашего нового канала.
2. Перешлите мне @username вашего канала`;
    const text9 = `Добавление товара

Чтобы добавить товар нужно:

1. Нажать на кнопку "Начать добавление ▶️"
2. Отправить название (1-32 символа)
3. Отправить описание товара (1-255 символа)
4. Отправьте фотографию товара
4. Отправить стоимость
5. Нажать на кнопку "Подтвердить"`;

    if(msg.text == '/start'){
        con.query(`SELECT * FROM users WHERE userid=${msg.from.id}`, function (err, result, fields) {
            const res = result[0];
            if(res?.id === undefined){
                con.query(`INSERT INTO users (userid, step, balance) VALUES (?, ?, ?)`, [user_id, 1, 0], function(err, result, fields) {
                    if(!err){
                        bot.sendMessage(chat_id, text1);
                    }
                })
            } else {
                if(res?.channel === null){ 
                    con.query(`UPDATE users SET step = 1 WHERE userid = ${user_id}`);  //
                    bot.sendMessage(chat_id, text1);
                } else {
                    con.query(`UPDATE users SET step = 3 WHERE userid = ${user_id}`);
                    bot.sendMessage(chat_id, text2);
                }
            }
        });
    } else if(msg.text == '/add_channel') {
        con.query(`SELECT channel FROM users WHERE userid=${user_id}`, function (err, result, fields) {
            const res = result[0];
            if(res?.channel === null){
                con.query(`UPDATE users SET step = 2 WHERE userid = ${user_id}`);
                bot.sendMessage(chat_id, text3);
            } else {
                con.query(`UPDATE users SET step = 3 WHERE userid = ${user_id}`);
                bot.sendMessage(chat_id, text2);
            }
        });
    } else if(msg.text == '/edit_channel') {
        con.query(`SELECT channel FROM users WHERE userid=${user_id}`, function (err, result, fields) {
            const res = result[0];
            if(res?.channel === null){
                con.query(`UPDATE users SET step = 1 WHERE userid = ${user_id}`);
                bot.sendMessage(chat_id, text1);
            } else {
                con.query(`UPDATE users SET step = 4 WHERE userid = ${user_id}`);
                bot.sendMessage(chat_id, text8);
            }
        });
    } else if(msg.text == '/add_product') {
        con.query(`SELECT channel FROM users WHERE userid=${user_id}`, function (err, result, fields) {
            const res = result[0];
            if(res?.channel === null){
                con.query(`UPDATE users SET step = 1 WHERE userid = ${user_id}`);
                bot.sendMessage(chat_id, text1);
            } else {
                con.query(`UPDATE users SET step = 5 WHERE userid = ${user_id}`);
                bot.sendMessage(chat_id, text9, {
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
            }
        });
    } else if(msg.text == '/payment') {
        con.query(`SELECT * FROM users WHERE userid=${user_id}`, function (err, result, fields) {
            const res = result[0];
            bot.sendMessage(chat_id, `Ваш баланс: ${res?.balance}
            
Минимальная сумма вывода: 100 RUB`, {
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
        });
    } else if(msg.text == '/my_orders') {
        con.query(`SELECT * FROM payments`, function (err, result, fields) {
            result.forEach(element => {
                bot.sendMessage(chat_id, `Платеж №${element.id}
ID поста: ${element.postid}
Цена: ${element.amount/100}

`)
            });
        });
    } else {
        con.query(`SELECT * FROM users WHERE userid=${user_id}`, function (err, result, fields) {
            const response = result[0];
            if(response?.step === 2){
                let username = msg.text;
                bot.getChatAdministrators(username).then(res => {
                    if(res[0].can_post_messages){
                        if(res[1].user.id === user_id){
                            con.query(`UPDATE users SET step = ?, channel = ? WHERE userid = ${user_id}`, [3, username]);
                            axios.get(`https://api.telegram.org/bot${token}/getUpdates`);
                            bot.sendMessage(chat_id, text6);
                        } else{
                            con.query(`UPDATE users SET step = 2 WHERE userid = ${user_id}`);
                            bot.sendMessage(chat_id, text7);
                        }
                    }
                }).catch(err => {
                    if(err.code == 'ETELEGRAM'){
                        con.query(`UPDATE users SET step = 2 WHERE userid = ${user_id}`);
                        bot.sendMessage(chat_id, text5);
                    } else {
                        con.query(`UPDATE users SET step = 2 WHERE userid = ${user_id}`);
                        bot.sendMessage(chat_id, text4);
                    }
                });
            } else if(response?.step === 4) {
                let username = msg.text;
                bot.getChatAdministrators(username).then(res => {
                    if(res[0].can_post_messages){
                        if(res[1].user.id === user_id){
                            con.query(`UPDATE users SET step = ?, channel = ? WHERE userid = ${user_id}`, [3, username]);
                            axios.get(`https://api.telegram.org/bot${token}/getUpdates`);
                            bot.sendMessage(chat_id, text6);
                        } else{
                            con.query(`UPDATE users SET step = 4 WHERE userid = ${user_id}`);
                            bot.sendMessage(chat_id, text7);
                        }
                    }
                }).catch(err => {
                    if(err.code == 'ETELEGRAM'){
                        con.query(`UPDATE users SET step = 2 WHERE userid = ${user_id}`);
                        bot.sendMessage(chat_id, text5);
                    } else {
                        con.query(`UPDATE users SET step = 2 WHERE userid = ${user_id}`);
                        bot.sendMessage(chat_id, text4);
                    }
                });
            } else if(response?.step === 6) {
                let title = msg.text;
                con.query(`UPDATE users SET step = 7 WHERE userid = ${user_id}`);
                con.query(`UPDATE posts SET title = ? WHERE id = ${currentPost}`, [title]);
                bot.sendMessage(chat_id, `Отлично, теперь отправь описание`);
            } else if(response?.step === 7) {
                let title = msg.text;
                con.query(`UPDATE users SET step = 8 WHERE userid = ${user_id}`);
                con.query(`UPDATE posts SET des = ? WHERE id = ${currentPost}`, [title]);
                bot.sendMessage(chat_id, `А теперь фотографию`);
            } else if(response?.step === 8) {
                let file_id = msg.photo[2].file_id;
                axios.get(`https://api.telegram.org/bot${token}/getFile?file_id=${file_id}`).then(res => {
                    let file_url = `https://api.telegram.org/file/bot${token}/${res.data.result.file_path}`;
                    con.query(`UPDATE posts SET image = ? WHERE id = ${currentPost}`, [file_id]);
                    con.query(`UPDATE users SET step = 9 WHERE userid = ${user_id}`);
                    https.request(file_url, function(response) {                                        
                      var data = new Stream();
                      response.on('data', function(chunk) {                                       
                        data.push(chunk);                                                         
                      });
                      response.on('end', function() {                                             
                        fs.writeFileSync(`./photo/${file_id}.png`, data.read());                               
                      });
                    }).end();
                    bot.sendMessage(chat_id, `А теперь цену`);
                });
            } else if(response?.step === 9) {
                let title = msg.text;
                con.query(`UPDATE users SET step = 10 WHERE userid = ${user_id}`);
                con.query(`UPDATE posts SET price = ? WHERE id = ${currentPost}`, [title]);
                console.log(currentPost);
                bot.sendMessage(chat_id, `Цен сохранена`, {
                    reply_markup: {
                        "inline_keyboard": [
                            [
                                {
                                    "text": "Опубликовать!",
                                    "callback_data": "push_product"            
                                }
                            ],
                            [
                                {
                                    "text": "Показать превью!",
                                    "callback_data": "preview_product"            
                                }
                            ]
                        ]
                    }
                });
            } else if(response?.step === 11) {
                console.log(msg)
            }
        });
    }

    if(user_id == 386567097 && msg.text == '/stat'){
        con.query(`SELECT * FROM users`, function (err, result, fields) {
            let users = result.length;
            con.query(`SELECT * FROM posts`, function (err, result, fields) {
                let posts = result.length;
                bot.sendMessage(chat_id, `Кол-во юзеров: ${users}
Кол-во постов: ${posts}
`)
            });
        });
    }
});

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
    };
    const user_id = msg.chat.id;
    let text;
    if (action === 'add_product') {
        con.query(`SELECT channel FROM users WHERE userid=${user_id}`, function (err, result, fields) {
            const res = result[0];
            con.query(`INSERT INTO posts (userid, channel) VALUES (?, ?)`, [user_id, res?.channel], function(err, result, fields) {
                if(!err){
                    con.query(`UPDATE users SET step = 6 WHERE userid = ${user_id}`);
                    currentPost = result.insertId;
                }
            });
        });
        text = 'Отправь название товара (1-32)';
        bot.editMessageText(text, opts);
    } else if (action === 'push_product') {
        con.query(`UPDATE users SET step = 1 WHERE userid = ${user_id}`);
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
        text = 'Опубликовано';
        bot.editMessageText(text, opts);
    } else if (action === 'preview_product') {
        con.query(`UPDATE users SET step = 11 WHERE userid = ${user_id}`);
        con.query(`SELECT * FROM posts WHERE id=${currentPost}`, function (err, result, fields) {
            let post = result[0];
            let payload = currentPost;
            let token = '381764678:TEST:47026';
            let prices = [{
                label: post.title,
                amount: 100 * post.price
            }];
            let options = {
              photo_url: 'https://wpaka.uz/photo/file_id.png',
              photo_width: 800,
              photo_height: 400
            }
            try {
                bot.sendInvoice(opts.chat_id, post.title, post.des, payload, token, "pay", "RUB", prices, options);
            } catch (error) {
                console.log(error);
            }
            bot.sendMessage(opts.chat_id, `Опубликуем`, {
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
    }
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
    bot.sendMessage(res.userid, `Поступил заказ №${callbackQuery.message_id};

от ${callbackQuery.from.first_name} (${callbackQuery.from.id})
    
Пост: ${callbackQuery.successful_payment.invoice_payload} (${amount} рублей)`)
  });
});