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
        "consumerKey": "XCCmzUhGIbCWlh35N0J7oxDSR",
        "consumerSecret": "RFUYFrsLcn2SGKdMWvMj27vNyubZs3D9XQBCupnPeTuzjoaUjD",
        "accessToken": "29933421-pZTFh36uJn7SFFhElYb7tAGCR7n3iiRZBzApAKhP0",
        "accessTokenSecret": "3NSa1i6DzOBsQxlzAu0TBGZCvEQq2AaC7NN7GR13BS4vN"
    }

    var twitter = new Twitter(config);

     var bob = twitter.getUserTimeline({ screen_name: 'SamuelLJackson', count: '9'}, error, success);
