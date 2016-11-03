function stretchReminder(bot, message){

    let date = new Date(); // Create a Date object to find out what time it is
    //if ((date.getHours() >= 20 && date.getMinutes() >= 00) || (date.getHours() <= 22 && date.getMinutes() <= 00)) {
    if(date.getHours() <= 17){ // Check the time
    	bot.reply(message, 'GET UP AND STRETCH MOTHAFUCKA!');
    }
}

module.exports = {
	stretchReminder: stretchReminder
}