var unirest = require('unirest');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = function(msg, command, terms){
  if (command == 'xkcd'){
    unirest.get("https://xkcd.com/info.0.json")
      .query({} )
      .end(function(response) {
        if (response.status == 200) {
          var last = response.body.num;
          var comic = getRandomInt(1, last);
          unirest.get("https://xkcd.com/"+comic+"/info.0.json")
            .query({} )
            .end(function(response) {
              if (response.status == 200) {
                msg.reply("\n" +response.body.title +"\n" + response.body.img);
              } else {
                msg.reply("Failed!");
              }
            })
        } else {
          msg.reply("Failed!");
        }
      });
  }
};
