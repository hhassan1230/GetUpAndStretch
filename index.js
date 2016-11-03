const secrets = require('./secrets.local');
const moment = require('moment');
const botkit = require('botkit');

// local state
const state = {
    userNickName: null,
    timeCandyLastFilled: null
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

	state.timeCandyLastFilled = new Date();

	bot.reply(message, 'Thanks for notifying me that there is delicious candy in the kitchen.  I will inform everyone.');
});

controller.hears('candy', ['direct_message','direct_mention'], function(bot,message) {
	console.log('Candy request received');

	bot.reply(message, 'The time the candy jars were filled last in the kitchen was' + timeCandyLastFilled);
});

// Name calling
controller.hears('call me', ['direct_message', 'direct_mention'], function (bot, message) {
    state.userNickName = message.text.replace('call me ', '');

    bot.reply(message, 'ok, I\'ll call you ' + state.userNickName);
});

controller.hears('who am i?', ['direct_message', 'direct_mention'], function (bot, message) {
    if (state.userNickName) {
        bot.reply(message, 'You told me before your name was ' + state.userNickName);
    }
    else {
        bot.reply(message, 'You haven\'t told me your name yet. You can tell me by saying: `call me <name>`');
    }
});