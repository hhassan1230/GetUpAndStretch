const secrets = require('./secrets.local');
const moment = require('moment');
const botkit = require('botkit');

const onehour = 1000 * 60 * 60;

if (!secrets.API_KEY) {
    console.log('Error: Specify a token secrets file');

    process.exit(1);
}

// local state
const state = {
    userNickName: {},
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

    state.timeCandyLastFilled = +(new Date());

    bot.reply(message, 'Thanks for notifying me that there is delicious candy in the kitchen.  I will inform everyone.');
});

controller.hears('candy', ['direct_message','direct_mention'], function(bot, message) {

    function sendMessage(msg) {
        bot.reply(message, secrets.botInstanceName + msg);
    }

    if (!state.timeCandyLastFilled) {
        sendMessage('I have no idea when the candy was last filled.  Why don\'t you just get up and see for yourself!');
    } else {
        const prettyTime = moment(state.timeCandyLastFilled).fromNow();

        sendMessage('The time the candy jars were filled last in the kitchen was ' + prettyTime);

        const now = +(new Date());
        const timeSinceCandyLastFilled = now - state.timeCandyLastFilled;
        if (timeSinceCandyLastFilled < onehour * 0.5) {
            sendMessage('Your chances of there being candy is *GOOD*, mutha fucker!');
        } else if (timeSinceCandyLastFilled < onehour) {
            sendMessage('Your chances of there being candy is _OKAY_, mutha fucker!');
        } else if (timeSinceCandyLastFilled < onehour * 3) {
            sendMessage('Your chances of there being candy is SLIM, mutha fucker!');
        }
    }
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

controller.hears(/who am i\??/, ['direct_message', 'direct_mention'], function (bot, message) {
    console.log(state.userNickName);

    if (state.userNickName[message.user]) {
        bot.reply(message, 'You fucking told me before your name was ' + state.userNickName[message.user]);
    }
    else {
        bot.reply(message, 'You haven\'t fucking told me your name yet. You can tell me by saying: `call me <name>`');
    }
});

controller.hears(['check', 'see', 'how', 'funny'], ['direct_message', 'direct_mention'], function (bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'middle_finger'
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });
});

controller.hears('', ['presence_change'], function (bot, message) {
    console.log(message);
});