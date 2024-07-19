const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { message } = require("telegraf/filters");
const path = require('path');
const process = require('process');
const bodyParser = require('body-parser');
require('dotenv').config()


const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Serve the Unity WebGL game if needed, otherwise skip this part
app.use(express.static(path.join(__dirname, 'path-to-your-unity-webgl-build'), {
    setHeaders: function (res, path) {
        if (path.match('.br')) {
            res.set('Content-Encoding', 'br');
            res.set('Content-Type', 'application/wasm');
        }
    }
}));

const bot = new Telegraf(process.env.BOT_TOKEN);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Catch any errors in the bot
bot.catch((err, ctx) => {
    console.error('Bot encountered an error:', err);
});

// Define bot behavior on receiving a text message
bot.on(message('text'), async (ctx) => {
    console.log('#msg', ctx.message.text);
    await ctx.reply("Welcome to CW 🤡!!!", Markup.inlineKeyboard([{
        text: "🤟Let's play🤟",
        web_app: {
            url: process.env.APP_ENDPOINT // URL to the hosted Unity WebGL game
        }
    }]));
});

// Start polling Telegram servers for updates
bot.launch();

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}/`);
});
