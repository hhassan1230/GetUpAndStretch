//
// TODO: Replace <my_slack_bot_token> with the API token from the Slack Slackbot Integration configuration
//

const botkit = require('botkit');

const controller = botkit.slackbot({
  debug: false,
});

// connect the bot to a stream of messages
controller.spawn({
  token: 'TOKEN_GOES_HERE'
}).startRTM();

// give the bot something to listen for.
controller.hears('hello', ['direct_message','direct_mention'], function(bot,message) {

  bot.reply(message, 'Hello yourself, I am alive!');
});
controller.hears('what up mofo', ['direct_message','direct_mention'], function(bot,message) {
	setTimeout(punkReply, 2000);

	function punkReply(){
		bot.reply(message, 'Look here motherfuka! I ain\'t got time for your punk ass');
	}
});