var unirest = require('unirest');

module.exports = function(msg, command, terms){
  if (command == 'giphy'){
    unirest.get("http://api.giphy.com/v1/gifs/random")
      .query({api_key: "dc6zaTOxFJmzC",tag:terms })
      .end(function(response) {
        if (response.status == 200) {
          var gif = response.body.data.image_url;
          gif == undefined ? msg.reply("No results, idiot") : msg.reply(gif);
        } else {
          msg.reply("Failed!");
        }
      })
  }
};

