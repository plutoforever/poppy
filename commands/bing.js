var unirest = require('unirest');

module.exports = function(msg, command, terms){
  if (command == 'bing') {
    unirest.get("https://www.bing.com/images/async")
      .query({q: terms, async: "content", first: "1", adlt: "off"})
      .end(function(response) {
        if (response.status == 200) {
          let f = /murl&quot;:&quot;(.*?)&quot;/.exec(response.body);
          if (f) {
            msg.reply("**NSFW:** " + f[1]);
          } else {
            msg.reply("No results.");
          }
        } else {
          msg.reply("Failed to pull image!");
        }
      })
  }
};

