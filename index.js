const secrets = require('./secrets.local');
const moment = require('moment');
const botkit = require('botkit');
const { stretchReminder } = require('./reminders');

// local state
const state = {
    userNickName: null,
    hourInterval: 5000,
    userNickName: {},
    reminderSet: false,
    timeCandyLastFilled: null
};

const controller = botkit.slackbot({
    debug: false
});

let reminderInterval;

// connect the bot to a stream of messages
controller.spawn({
    token: secrets.API_KEY
}).startRTM();

// give the bot something to listen for.
controller.hears('hello', ['direct_message', 'direct_mention'], function (bot, message) {
    bot.reply(message, 'Hello yourself, I am alive!');
});

controller.hears('remind me to stretch', ['direct_message', 'direct_mention'], function (bot, message) {
    if (!state.reminderSet) {
    	reminderInterval = setInterval(
    		stretchReminder.bind(this, bot, message), 
    		state.hourInterval
		);
		state.reminderSet = true;
	    bot.reply(message, 'YOU GON BE REMINDED MOTHAFUCKA!');
	    bot.reply(message, 'To quit reminders type: `stop reminding me mothafucka`');
    } else {
	    bot.reply(message, 'YOU ALREADY BEIN REMINDED YOU STUPID MOTHAFUCKA!');
    }
});

controller.hears('stop reminding me mothafucka', ['direct_message', 'direct_mention'], function (bot, message) {
    function clearReminder(){
	    clearInterval(reminderInterval)
	}

	clearReminder();

    bot.reply(message, 'No more reminders mothafucka, have fun being a fatass mothafucka!'.toUpperCase());
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

	bot.reply(message, 'The time the candy jars were filled last in the kitchen was' + state.timeCandyLastFilled);
});

// Name calling
controller.hears('call me', ['direct_message', 'direct_mention'], function (bot, message) {
    state.userNickName[message.user] = message.text.replace('call me ', '');

    console.log(message);

    bot.reply(message, 'You don\'t tell me, what to do motherfucker!...');

    setTimeout(function () {
        bot.reply(message, 'ok fine, I\'ll call you ' + state.userNickName[message.user]);
    }, 2000);
});

controller.hears('who am i?', ['direct_message', 'direct_mention'], function (bot, message) {
    console.log(state.userNickName);

    if (state.userNickName[message.user]) {
        bot.reply(message, 'You fucking told me before your name was ' + state.userNickName[message.user]);
    }
    else {
        bot.reply(message, 'You haven\'t fucking told me your name yet. You can tell me by saying: `call me <name>`');
    }
});

controller.hears(['check', 'see', 'how', 'funny'], ['direct_message', 'direct_mention'], function (bot, message) {
    bot.reply(message, ':middle_finger:');
});

