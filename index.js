const secrets = require('./secrets.local');
const moment = require('moment');
const botkit = require('botkit');
const { stretchReminder } = require('./reminders');
const os = require('os');

const onehour = 1000 * 60 * 60;

if (!secrets.API_KEY) {
    console.log('Error: Specify a token secrets file');
    process.exit(1);
}

// local state
const state = {
    userNickName: null,
    hourInterval: 5000,
    userNickName: {},
    reminderSet: false,
    timeCandyLastFilled: null
    upTimestamp: new Date(),
};

// setup
const controller = botkit.slackbot({
    debug: false
});

let reminderInterval;

// connect the bot to a stream of messages
var botInstance = controller.spawn({
    token: secrets.API_KEY
}).startRTM(function () {
    console.log('Done initializing.');
});

// utilities
function sendMessage(message, reply) {
    botInstance.reply(message, secrets.botInstanceName + reply);
}
//when bot enters the room
controller.on('channel_joined',function(bot,message) {

  sendMessage(message,"Can-a muh fukkasay fuck on here?");

});
// give the bot something to listen for.
controller.hears(
    ['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {
        var hostname = os.hostname();
        var uptime = moment(state.upTimestamp).fromNow();

        sendMessage(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
            '>. I have been running for ' + uptime + ' on ' + hostname + '.'
        );
    }
);

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
        sendMessage(message, 'Look here motherfuka! I ain\'t got time for your punk ass');
    }
});

controller.hears('restocked', ['direct_message','direct_mention'], function(bot,message) {
    console.log('Candy restock notification received');

    state.timeCandyLastFilled = +(new Date());

    sendMessage(message, secrets.botInstanceName + 'Thanks for notifying me that there is delicious candy in the kitchen.  I will inform everyone.');
});

controller.hears('candy', ['direct_message','direct_mention'], function(bot, message) {

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
controller.hears([/^call me ?(.*)?$/, /^my name is ?(.*)?$/], ['direct_message', 'direct_mention'], function (bot, message) {
    const nickName = message.match[1];
    console.log(message.match);

    if (!nickName) {
        sendMessage(message, 'Call you what?? What did you want me to fucking call you?');

        if (state.userNickName[message.user]) {
            sendMessage(message, 'I\'ll keep calling you ' + state.userNickName[message.user]);
        }
    }
    else {
        state.userNickName[message.user] = nickName;
        sendMessage(message, 'You don\'t tell me, what to do motherfucker!...');

        setTimeout(function () {
            sendMessage(message, 'ok fine, I\'ll call you ' + state.userNickName[message.user]);
        }, 2000);
    }
});

function whoami(message) {
    if (state.userNickName[message.user]) {
        return 'You fucking told me before your name was ' + state.userNickName[message.user];
    }
    else {
        return 'You haven\'t fucking told me your name yet. You can tell me by saying: `call me <name>`';
    }
}

controller.hears(/who am i\??/, ['direct_message', 'direct_mention'], function (bot, message) {
    const reply = whoami(message);

    sendMessage(message, reply);
});

controller.hears(['what', 'when', 'how', 'why', "where", "funny"], ['direct_message', 'direct_mention'], function (bot, message) {
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
