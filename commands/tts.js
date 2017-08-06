//sudo apt-get install build-essential
//ffmpeg + tts.py + node
//sudo pip install gTTS
//sudo npm install --global ffmpeg-binaries
//sudo pip install -U requests
//sudo apt-get install ca-certificates


var cmd= require('node-cmd');
var Promise = require("bluebird");

module.exports = function(msg, command, terms){
  if (command == 'tts') {
    if (msg.member.voiceChannel) {
      console.log(terms);
      cmd.run('rm hello.*');
      //cmd.get('./convert.sh ' + '"'+terms+'"');
      //cmd.run('echo ' + '"' + terms + '"' + '| text2wave -o output.wav');
      const getAsync = Promise.promisify(cmd.get, { multiArgs: true, context: cmd });
      getAsync('python ./commands/tts/tts.py '+'"'+terms+'"').then(data => {
        //console.log('cmd data', data)
        msg.member.voiceChannel.join()
          .then(connection => { // Connection is an instance of VoiceConnection
            //var soundList = ["emma_because.opus", "emma_bye.opus", "emma_cough.opus", "emma_squirt.opus", "emma_teetee.opus"];
            //var randy = getRandomInt(0, soundList.length-1);
            //var randEmma = soundList[randy];
            //const dispatcher = connection.playFile('/home/dev/poppy/' + randEmma);
            //const dispatcher = connection.playFile('/home/dev/poppy/output.opus');

            const dispatcher = connection.playFile('hello.opus');
            dispatcher.on("end", end => {
              msg.member.voiceChannel.leave();
              cmd.run('rm hello.*');
            });
            dispatcher.on('error', e => {
              // Catch any errors that may arise
              console.log(e);
              msg.member.voiceChannel.leave();
              cmd.run('rm hello.*');
            });
          })
          .catch(err => console.log(err));
      }).catch(err => {
        console.log('cmd err', err)
        msg.reply("Sorry dad, google's server has fucked up.");
      })
      //cmd.get('python tts.py ' + '"'+terms+'"');

    } else {
      msg.reply('You need to join a voice channel first!');
    }
  }
};

