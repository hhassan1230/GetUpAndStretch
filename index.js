const botkit = require('botkit');

let timeCandyLastFilled = null;

const controller = botkit.slackbot({
  debug: true,
});

// connect the bot to a stream of messages
controller.spawn({
  token: ''
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

controller.hears('restocked', ['direct_message','direct_mention'], function(bot,message) {
	console.log('Candy restock notification received');
	timeCandyLastFilled = +(new Date());
	bot.reply(message, 'Thanks for notifying me that there is delicious candy in the kitchen.  I will inform everyone.');
});

controller.hears('candy', ['direct_message','direct_mention'], function(bot,message) {
	console.log('Candy request received');
	bot.reply(message, 'The time the candy jars were filled last in the kitchen was' + timeCandyLastFilled);
});