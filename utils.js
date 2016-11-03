const secrets = require('./secrets.local');
const os = require('os');
const moment = require('moment');

module.exports = function (controller, botInstance) {
    function saveUser(user, cb) {
        controller.storage.users.save(user, function (err, user) {
            if (err) {
                console.error(err);
            }

            cb && cb(err, user);
        });
    }

    function getUser(messageUser, cb) {
        controller.storage.users.get(messageUser, function (err, user) {
            if (err) {
                console.error(err);
            }

            if (!user) {
                user = {
                    id: messageUser
                };
            }

            cb(err, user);
        });
    }

    function sendMessage(message, reply) {
        botInstance.reply(message, secrets.botInstanceName + reply);
    }

    const upTime = new Date();

    function identifyBot() {
        const hostname = os.hostname();
        const uptime = moment(upTime).fromNow();

        return ':robot_face: I am a bot named <@' + botInstance.identity.name +
            '>. I have been running for ' + uptime + ' on ' + hostname + '.';
    }

    return {
        saveUser: saveUser,
        getUser: getUser,
        sendMessage: sendMessage,
        identifyBot: identifyBot
    }
};
