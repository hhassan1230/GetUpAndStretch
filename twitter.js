   const secrets = require('./secrets.local');

    var error = function (err, response, body) {
        console.log('ERROR [%s]', err);
    };
    var success = function (data) {
    	let cool = JSON.parse(data).map(function(e){return e.text});
        console.log(cool)
    };

    var Twitter = require('twitter-js-client').Twitter;

    //Get this data from your twitter apps dashboard
    var config = {
        "consumerKey": secrets.consumerKey,
        "consumerSecret": secrets.consumerSecret,
        "accessToken": secrets.accessToken,
        "accessTokenSecret": secrets.accessTokenSecret
    }

    var twitter = new Twitter(config);

     var bob = twitter.getUserTimeline({ screen_name: 'SamuelLJackson', count: '9'}, error, success);
