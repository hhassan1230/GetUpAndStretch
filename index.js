const secrets = require('./secrets.local');
const moment = require('moment');
const botkit = require('botkit');
const os = require('os');

const onehour = 1000 * 60 * 60;

if (!secrets.API_KEY) {
    console.log('Error: Specify a token secrets file');

    process.exit(1);
}

// local state
const state = {
    userNickName: {},
    timeCandyLastFilled: null,
    upTimestamp: new Date()
};

// setup
const controller = botkit.slackbot({
    debug: false
});

// connect the bot to a stream of messages
var botInstance = controller.spawn({
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

// utilities
function sendMessage(message, reply) {
    botInstance.reply(message, secrets.botInstanceName + reply);
}

function indentifyBot() {
    var hostname = os.hostname();
    var uptime = moment(state.upTimestamp).fromNow();

    return ':robot_face: I am a bot named <@' + botInstance.identity.name +
        '>. I have been running for ' + uptime + ' on ' + hostname + '.';
}

// give the bot something to listen for.
controller.hears(['hi', 'hello'], ['direct_message', 'direct_mention'], function (bot, message) {
    controller.storage.users.get(message.user, function (err, user) {
        if (user && user.name) {
            sendMessage(message, 'Hello ' + user.name + '!!');
        } else {
            sendMessage(message, 'Hello.');
        }
    });

    const identity = indentifyBot();
    sendMessage(message, identity)
});

controller.hears(
    ['uptime', 'identify yourself', 'who are you', 'what is your name'],
    ['direct_message', 'direct_mention'],
    function (bot, message) {
        const identity = indentifyBot();
        sendMessage(identity)
    }
);

controller.hears('what up mofo', ['direct_message', 'direct_mention'], function (bot, message) {
    setTimeout(punkReply, 2000);

    function punkReply() {
        sendMessage(message, 'Look here motherfuka! I ain\'t got time for your punk ass');
    }
});

controller.hears('restocked', ['direct_message', 'direct_mention'], function (bot, message) {
    console.log('Candy restock notification received');

    state.timeCandyLastFilled = +(new Date());

    sendMessage(message, secrets.botInstanceName + 'Thanks for notifying me that there is delicious candy in the kitchen.  I will inform everyone.');
});

controller.hears(['candy'], ['direct_message', 'direct_mention'], function (bot, message) {

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

function getUser(messageUser, cb) {
    controller.storage.users.get(messageUser, function(err, user) {
        if (!user) {
            user = {
                id: messageUser
            };
        }

        cb(err, user);
    });
}

function saveUser(user, cb) {
    controller.storage.users.save(user, cb);
}

function startNameConvo(message, user) {
    let nickName;

    botInstance.startConversation(message, function(err, convo) {
        if (!err) {
            convo.ask('Say your name! :punch: I said say your name, motherfucker! :punch:', function (response, convo2) {
                nickName = response.text;
                console.log(nickName);
                console.log(botInstance.utterances.yes);
                convo2.ask('You want me to call you ' + response.text + '?', [
                    {
                        pattern: botInstance.utterances.yes,
                        callback: function(response, convo) {
                            console.log(nickName);
                            user.name = nickName;

                            convo.say('ok!');
                            // since no further messages are queued after this,
                            // the conversation will end naturally with status == 'completed'
                            convo.next();
                        }
                    },
                    {
                        pattern: botInstance.utterances.no,
                        callback: function(response, convo) {
                            console.log(nickName);
                            // stop the conversation. this will cause it to end with status == 'stopped'
                            sendMessage('Fine!');
                            convo.stop();
                        }
                    },
                    {
                        default: true,
                        callback: function(response, convo) {
                            console.log(nickName);
                            convo.repeat();
                            convo.next();
                        }
                    }
                ]);

                convo.next();
            });
        }
    });
}

// Name calling
controller.hears([/^call me ?(.*)?$/, /^my name is ?(.*)?$/], ['direct_message', 'direct_mention'], function (bot, message) {
    const nickName = message.match[1];

    getUser(message.user, function(err, user) {
        if (!nickName) {
            sendMessage(message, 'Call you what?? You didn\'t fucking tell me what to call you?');

            if (user.name) {
                sendMessage(message, 'I\'ll keep calling you ' + user.name);
            }
            else {
                startNameConvo(message, user);
            }
        }
        else {
            user.name = nickName;

            saveUser(user, function (err, id) {
                sendMessage(message, 'You don\'t tell me, what to do motherfucker!...');

                setTimeout(function () {
                    sendMessage(message, 'ok fine, I\'ll call you ' + nickName);
                }, 2000);
            });
        }
    });
});

function whoami(message) {
    if (state.userNickName[message.user]) {
        return 'You fucking told me before your name was ' + state.userNickName[message.user];
    }
    else {
        return 'You haven\'t fucking told me your name yet. You can tell me by saying: `call me <name>`';
    }
}

controller.hears(/^who am i$/, ['direct_message', 'direct_mention'], function (bot, message) {
    console.log(message);
    const reply = whoami(message);
    console.log(reply);

    sendMessage(message, reply);
});

controller.hears(['check', 'see', 'how', 'funny'], ['direct_message', 'direct_mention'], function (bot, message) {
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
