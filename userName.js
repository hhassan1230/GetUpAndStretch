module.exports = function (controller, botInstance) {
    const utils = require('./utils')(controller, botInstance);

    function startNameConvo(message, cb) {
        let nickName;

        botInstance.startConversation(message, function (err, convo) {
            if (!err) {
                convo.ask('Say your name! :punch: I said say your name, motherfucker! :punch:', function (response, convo) {
                    nickName = response.text;

                    convo.ask('You want me to call you ' + response.text + '?', [
                        {
                            pattern: botInstance.utterances.yes,
                            callback: function (response, convo) {
                                convo.say('ok!');
                                // since no further messages are queued after this,
                                // the conversation will end naturally with status == 'completed'
                                convo.next();

                                cb(nickName);
                            }
                        },
                        {
                            pattern: botInstance.utterances.no,
                            callback: function (response, convo) {
                                // stop the conversation. this will cause it to end with status == 'stopped'
                                convo.say('Fine then, I don\'t fucking care about your motherfucking name!');

                                convo.next();
                            }
                        },
                        {
                            default: true,
                            callback: function (response, convo) {
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

        utils.getUser(message.user, function (err, user) {
            if (!nickName) {
                utils.sendMessage(message, 'Call you what?? You didn\'t fucking tell me what to call you?');

                if (user.name) {
                    utils.sendMessage(message, 'I\'ll keep calling you ' + user.name);
                }
                else {
                    startNameConvo(message, function (nickName) {
                        user.name = nickName;
                        utils.saveUser(user);
                    });
                }
            }
            else {
                user.name = nickName;

                utils.saveUser(user, function () {
                    utils.sendMessage(message, 'You don\'t tell me, what to do motherfucker!...');

                    setTimeout(function () {
                        utils.sendMessage(message, 'ok fine, I\'ll call you ' + nickName);
                    }, 2000);
                });
            }
        });
    });

    controller.hears(['who am i'], ['direct_message', 'direct_mention'], function (bot, message) {
        utils.getUser(message.user, function (err, user) {
            if (user.name) {
                utils.sendMessage(message, 'You fucking told me before your name was ' + user.name);
            }
            else {
                utils.sendMessage(message, 'You haven\'t told me your fucking name.');

                startNameConvo(message, function (nickName) {
                    user.name = nickName;
                    utils.saveUser(user);
                });
            }
        });
    });
};
