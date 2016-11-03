const moment = require('moment');
const botkit = require('botkit');
const {stretchReminder} = require('./reminders');
const secrets = require('./secrets.local');
const {getTweets} = require('./twitter');

const profileImg = 'https://avatars.slack-edge.com/2016-11-03/100378866773_45fc1fcfa40df24a68c1_48.png';
const profileName = 'Samuel Jackson';

const onehour = 1000 * 60 * 60;

if (!secrets.API_KEY) {
    console.log('Error: Specify a token secrets file');
    process.exit(1);
}

// local state
const state = {
    hourInterval: 5000, // For Debug
    reminderSet: false
};

// setup
const controller = botkit.slackbot({
    debug: false,
    interactive_replies: true,
    json_file_store: './data',
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

const utils = require('./utils')(controller, botInstance);
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

controller.hears('open the pod bay doors hal', ['direct_message', 'direct_mention'], function (bot, message) {
    utils.sendMessage(message, 'I\'m sorry, Dave. I\'m afraid I can\'t do that.');
});

controller.hears('remind me to stretch every (.*)', ['direct_message', 'direct_mention'], function (bot, message) {
    if (state.reminderSet) {
        clearInterval(reminderInterval);
    }

    const timeType = message.match[1]; //match[1] is the (.*) group. match[0] is the entire group (open the (.*) doors).

    if (timeType === 'pod bay') {
        return bot.reply(message, 'I\'m sorry, Dave. I\'m afraid I can\'t do that.');
    }

    return bot.reply(message, `Okay reminding you every ${timeType}`);
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
    }
    else {
        bot.reply(message, 'YOU ALREADY BEIN REMINDED YOU STUPID MOTHAFUCKA!');
    }
});

controller.hears(['stop reminding me', 'stop reminding me mothafucka', 'stop reminding me muthafucka'], ['direct_message', 'direct_mention'], function (bot, message) {
    function clearReminder() {
        clearInterval(reminderInterval)
    }

    state.reminderSet = false;
    clearReminder();
    bot.reply(message, 'No more reminders mothafucka, have fun being a fatass mothafucka!'.toUpperCase());
});

controller.hears(['candy restocked', 'restocked'], ['direct_message', 'direct_mention'], function (bot, message) {
    utils.getTeamData(message.team, function (err, team) {
        team.timeCandyLastFilled = +(new Date());

        utils.sendMessage(message, 'Thanks for the note bro, I\'ll tell everyone else.');

        utils.saveTeamData(team);
    });
});

controller.hears('candy', ['direct_message', 'direct_mention'], function (bot, message) {
    utils.getTeamData(message.team, function (err, team) {
        if (!team.timeCandyLastFilled) {
            utils.sendMessage(message, 'I have no idea when the candy was last filled.  Why don\'t you just get up and see for yourself!');
        }
        else {
            const prettyTime = moment(team.timeCandyLastFilled).fromNow();

            utils.sendMessage(message, 'The time the candy jars were filled last in the kitchen was ' + prettyTime);

            const now = +(new Date());
            const timeSinceCandyLastFilled = now - team.timeCandyLastFilled;

            if (timeSinceCandyLastFilled < onehour * 0.5) {
                utils.sendMessage(message, 'Your chances of there being candy is *GOOD*, mutha fucker!');
            }
            else if (timeSinceCandyLastFilled < onehour) {
                utils.sendMessage(message, 'Your chances of there being candy is _OKAY_, mutha fucker!');
            }
            else if (timeSinceCandyLastFilled < onehour * 3) {
                utils.sendMessage(message, 'Your chances of there being candy is SLIM, mutha fucker!');
            }
        }
    });
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

controller.hears(['what did you say', 'whatdidyousay', 'saywhat'], ['direct_message', 'direct_mention'], function (bot, message) {
    function callback(tweets) {
        const randomTweet = Math.floor(Math.random() * tweets.length);
        bot.reply(message, {
            "attachments": [
                {
                    "author_name": profileName,
                    "author_icon": profileImg,
                    "image_url": "https://pbs.twimg.com/profile_images/742877069793742848/c0Ec2mTU.jpg",
                    "text": tweets[randomTweet]
                }
            ]
        });
    }

    getTweets(callback);
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

function reminderConversation(bot, message) {
    let nickName;
    state.reminderSet = true;
    botInstance.startConversation(message, function (err, convo) {
        if (!err) {
            convo.ask(`HOW OFTEN YOU WANNA BE REMINDED MOTHAFUCKA? 
                \`select A, B, C or D\`
                A) Every 30 minutes
                B) Every 60 minutes
                C) Every 90 minutes
                D) Every x minutes \`Input your own custom minutes\`
                `, function (response, convo) {
                const answer = response.text.toUpperCase();
                if (answer === 'A') {
                    reminderInterval = setInterval(stretchReminder.bind(this, bot, message), (1000 * 1800));
                    bot.reply(message, 'YOU GON BE REMINDED EVERY 30 MINUTES MOTHAFUCKA!');
                    bot.reply(message, 'To quit reminders type: `stop reminding me mothafucka`');
                    convo.stop();
                } else if (answer === 'B') {
                    reminderInterval = setInterval(stretchReminder.bind(this, bot, message), (1000 * 3600));
                    bot.reply(message, 'YOU GON BE REMINDED EVERY 60 MINUTES MOTHAFUCKA!');
                    bot.reply(message, 'To quit reminders type: `stop reminding me mothafucka`');
                    convo.stop();
                } else if (answer === 'C') {
                    reminderInterval = setInterval(stretchReminder.bind(this, bot, message), (1000 * 5400));
                    bot.reply(message, 'YOU GON BE REMINDED EVERY 90 MINUTES MOTHAFUCKA!');
                    bot.reply(message, 'To quit reminders type: `stop reminding me mothafucka`');
                    convo.stop();
                } else if (answer === 'D') {
                    convo.next();
                    convo.ask('WELL THEN HOW MANY MINUTES YOU WANNA BE REMINDED YOU PICKY MUFUCKA?', function (response, convo) {
                        let newAnswer = response.text;
                        newAnswer = parseInt(newAnswer);
                        reminderInterval = setInterval(stretchReminder.bind(this, bot, message), (1000 * newAnswer * 60));
                        if (newAnswer === 1) {
                            bot.reply(message, 'YOU GON BE REMINDED EVERY ' + newAnswer + ' MINUTE MOTHAFUCKA!');
                            bot.reply(message, 'To quit reminders type: `stop reminding me mothafucka`');
                        } else {
                            bot.reply(message, 'YOU GON BE REMINDED EVERY ' + newAnswer + ' MINUTE MOTHAFUCKA!');
                            bot.reply(message, 'To quit reminders type: `stop reminding me mothafucka`');
                        }
                        convo.stop();
                    });
                } else {
                    bot.reply(message, 'YO ANSWER WASN\'T UNDERSTOOD STUPID MOTHAFUCKA. LEARN TO FOLLOW DIRECTIONS YOU STUPID MOTHAFUCKA');
                    setTimeout(() => {
                        reminderConversation(bot, message);
                    }, 1500);

                }
            });
        }
    });
}

controller.hears('remind me', ['direct_message', 'direct_mention'], function (bot, message) {
    if (!state.reminderSet) {
        reminderConversation(bot, message);
    } else {
        bot.reply(message, 'YOU ALREADY BEIN REMINDED YOU STUPID MOTHAFUCKA!');
    }
});
