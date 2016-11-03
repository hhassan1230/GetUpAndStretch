const secrets = require('./secrets.local');

const error = function (err, response, body) {
    console.log('ERROR in twitter.js: [%o]', err);
};

const Twitter = require('twitter-js-client').Twitter;
const config = {
    "consumerKey": secrets.twitterConsumerKey,
    "consumerSecret": secrets.twitterConsumerSecret,
    "accessToken": secrets.twitterAccessToken,
    "accessTokenSecret": secrets.twitterAccessTokenSecret
};

const twitter = new Twitter(config);

function getTweets(callback) {
    function handleSuccess(data) {
        const tweets = JSON.parse(data).map(function (e) {
            return (e.text);
        });
        callback(tweets);
    }

    twitter.getUserTimeline({screen_name: 'SamuelLJackson', count: '20'}, error, handleSuccess);
}

module.exports = {
    getTweets: getTweets,
};