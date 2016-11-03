const moment = require('moment');
const botkit = require('botkit');
const {stretchReminder} = require('./reminders');
const secrets = require('./secrets.local');

const profileImg = 'https://avatars.slack-edge.com/2016-11-03/100378866773_45fc1fcfa40df24a68c1_48.png';
const profileName = 'Samuel Jackson';

const onehour = 1000 * 60 * 60;

if (!secrets.API_KEY) {
    console.log('Error: Specify a token secrets file');
    process.exit(1);
}

// local state
const state = {
    hourInterval: 5000,
    reminderSet: false,
    timeCandyLastFilled: null,
    upTimestamp: new Date()
};

// setup
const controller = botkit.slackbot({
    debug: false,
    interactive_replies: true
});

let reminderInterval;

// connect the bot to a stream of messages
const botInstance = controller.spawn({
    token: secrets.API_KEY,
    retry: 3
}).startRTM(function (err) {
    if (err) {
        console.error(err);
    }
    else {
        console.log('Done initializing.');
    }
});

const utils = require('./utils')(botInstance);
require('./userName')(controller, botInstance);

//when bot enters the room
controller.on(['bot_channel_join', 'bot_group_join'], function (bot, message) {
    utils.sendMessage(message, "Can-a muh fukkasay fuck on here?");
});

// give the bot something to listen for.
controller.hears(['hi', 'hello'], ['direct_message', 'direct_mention'], function (bot, message) {
    controller.storage.users.get(message.user, function (err, user) {
        if (user && user.name) {
            utils.sendMessage(message, 'Hello ' + user.name + '!!');
        } else {
            utils.sendMessage(message, 'Hello.');
        }
    });

    const identity = utils.identifyBot();
    utils.sendMessage(message, identity)
});

controller.hears('what up mofo', ['direct_message', 'direct_mention'], function (bot, message) {
    setTimeout(punkReply, 2000);

    function punkReply() {
        utils.sendMessage(message, 'Look here motherfuka! I ain\'t got time for your punk ass');
    }
});

controller.hears(
    ['uptime', 'identify yourself', 'who are you', 'what is your name'],
    ['direct_message', 'direct_mention'],
    function (bot, message) {
        const identity = utils.identifyBot();

        utils.sendMessage(message, identity)
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
    function clearReminder() {
        clearInterval(reminderInterval)
    }

    clearReminder();

    bot.reply(message, 'No more reminders mothafucka, have fun being a fatass mothafucka!'.toUpperCase());
});

controller.hears('restocked', ['direct_message', 'direct_mention'], function (bot, message) {
    console.log('Candy restock notification received');

    state.timeCandyLastFilled = +(new Date());

    utils.sendMessage(message, 'Thanks for notifying me that there is delicious candy in the kitchen.');
});

controller.hears('samuel', ['direct_message', 'direct_mention'], function (bot, message) {
    bot.reply(message, {
        "attachments": [
            {
                "author_name": profileName,
                "author_icon": profileImg,
                "image_url": "https://cdn.meme.am/instances/63982466.jpg",
            }
        ]
    });
});

controller.hears('candy', ['direct_message', 'direct_mention'], function(bot, message) {

    if (!state.timeCandyLastFilled) {
        utils.sendMessage(message, 'I have no idea when the candy was last filled.  Why don\'t you just get up and see for yourself!');
    } else {
        const prettyTime = moment(state.timeCandyLastFilled).fromNow();

        utils.sendMessage(message, 'The time the candy jars were filled last in the kitchen was ' + prettyTime);

        const now = +(new Date());
        const timeSinceCandyLastFilled = now - state.timeCandyLastFilled;
        if (timeSinceCandyLastFilled < onehour * 0.5) {
            utils.sendMessage(message, 'Your chances of there being candy is *GOOD*, mutha fucker!');
        } else if (timeSinceCandyLastFilled < onehour) {
            utils.sendMessage(message, 'Your chances of there being candy is _OKAY_, mutha fucker!');
        } else if (timeSinceCandyLastFilled < onehour * 3) {
            utils.sendMessage(message, 'Your chances of there being candy is SLIM, mutha fucker!');
        }
    }
});

controller.hears(['what', 'when', 'how', 'why', "where", "funny"], ['direct_message', 'direct_mention'], function (bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'middle_finger'
    }, function (err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });
});
