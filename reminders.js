const stretches = ['GET UP AND SQUAT MOTHAFUCKA!', 'GET UP AND TOUCH YO TOES MOTHAFUCKA!', 'GET UP AND DO SOME LUNGES MOTHAFUCKA!', 'GET UP AND DO SOME SIDE BENDS MOTHAFUCKA!', 'GET UP AND DO SOME KNEE HIGHS MOTHAFUCKA', 'GET UP AND DO SOME JUMPING JACKS', 'GET UP AND DO SOME NECK STRETCHES', 'GET UP AND DANCE MOTHAFUCKA'];

function stretchReminder(bot, message){
    let date = new Date(); // Create a Date object to find out what time it is
    //if ((date.getHours() >= 20 && date.getMinutes() >= 00) || (date.getHours() <= 22 && date.getMinutes() <= 00)) {
	var stretch = stretches[Math.floor(Math.random()*stretches.length)];

    if(date.getHours() <= 17){ // Check the time
    	bot.reply(message, stretch);
    }
}

module.exports = {
	stretchReminder: stretchReminder
}