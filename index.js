const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { message } = require("telegraf/filters");
const path = require('path');
const process = require('process');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config()

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const bot = new Telegraf(process.env.BOT_TOKEN);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const secretKey = process.env.JWT_SECRET_KEY;

// Catch any errors in the bot
bot.catch((err, ctx) => {
    console.error('Bot encountered an error:', err);
});

// In-memory user sessions (use a database for production)
const userSessions = {};

// Define bot behavior on receiving a text message
bot.on(message('text'), async (ctx) => {
    console.log('#msg', ctx.message.text);
    const userId = ctx.from.id;
    const userName = ctx.from.username;

    // Generate a secure token with a short expiration time
    const token = jwt.sign({ userId, userName }, secretKey, { expiresIn: '15m' });

    // Store the token with associated user data securely (e.g., in a database)
    userSessions[token] = { userId, userName };

    // Construct the URL with the token
    const gameUrl = `${process.env.APP_ENDPOINT}?token=${token}`;

    await ctx.reply("Welcome to CW 🤡!!!", Markup.inlineKeyboard([{
        text: "🤟Let's play🤟",
        web_app: {
            url: gameUrl // URL with token
        }
    }]));
});

// Endpoint to handle game requests for sensitive data
app.post('/get-user-data', (req, res) => {
    const { token } = req.body;

    try {
        const userData = jwt.verify(token, secretKey);
        res.json(userData);
    } catch (err) {
        res.sendStatus(401); // Unauthorized
    }
});

// Start polling Telegram servers for updates
bot.launch();

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}/`);
});
