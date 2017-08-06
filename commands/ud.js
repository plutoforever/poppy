var unirest = require('unirest');

module.exports = function(msg, command, terms){
  if (command == 'ud') {
    unirest.get("http://api.urbandictionary.com/v0/define")
      .query({term: terms})
      .end(function(response) {
        if (response.status == 200) {
          var f = response.body.list[0];
          if (typeof f != "undefined") {
            msg.reply("**Urban Dictionary:** " + f.definition);
          } else {
            msg.reply("No results.");
          }
        } else {
          msg.reply("Failed!");
        }
      })
  }
};

