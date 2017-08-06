//ffmpeg required + paths hardwired
var helper = require("../helper.js");


module.exports = function(msg, command, terms){
  if (command == 'gf') {
    if (msg.member.voiceChannel) {
      msg.member.voiceChannel.join()
        .then(connection => { // Connection is an instance of VoiceConnection
          var soundList = ["emma_because.opus", "emma_bye.opus", "emma_cough.opus", "emma_squirt.opus", "emma_teetee.opus"];
          var randy = helper.getRandomInt(0, soundList.length-1);
          var randEmma = soundList[randy];
          const dispatcher = connection.playFile('./commands/gf/' + randEmma);
          dispatcher.on("end", end => {
            msg.member.voiceChannel.leave();
          });
        })
        .catch(err => console.log(err));
    } else {
      msg.reply('You need to join a voice channel first!');
    }
  }
};

