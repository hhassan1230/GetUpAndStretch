const secrets = require('./secrets.local');
const moment = require('moment');
const botkit = require('botkit');

let timeCandyLastFilled = null;

// local state
const state = {
    userNickName: null
};

const controller = botkit.slackbot({
    debug: false
});

// connect the bot to a stream of messages
controller.spawn({
    token: secrets.API_KEY
}).startRTM();

// give the bot something to listen for.
controller.hears('hello', ['direct_message', 'direct_mention'], function (bot, message) {
    bot.reply(message, 'Hello yourself, I am alive!');
});

controller.hears('what up mofo', ['direct_message', 'direct_mention'], function (bot, message) {
    setTimeout(punkReply, 2000);

    function punkReply() {
        bot.reply(message, 'Look here motherfuka! I ain\'t got time for your punk ass');
    }
});

controller.hears('restocked', ['direct_message','direct_mention'], function(bot,message) {
	console.log('Candy restock notification received');
	timeCandyLastFilled = +(new Date());
	bot.reply(message, 'Thanks for notifying me that there is delicious candy in the kitchen.  I will inform everyone.');
});

controller.hears('candy', ['direct_message','direct_mention'], function(bot,message) {
	console.log('Candy request received');
	bot.reply(message, 'The time the candy jars were filled last in the kitchen was' + timeCandyLastFilled);
});

controller.hears('call me', ['direct_message', 'direct_mention'], function (bot, message) {
    let out = '';
    const myConsole = new console.Console(out, err);

    myConsole.log('bot:', bot);
    myConsole.log('message:', message);

    bot.reply(out);
});
