var r = require("nraw");
var Reddit = new r("useragent4bot");
var Entities = require('html-entities').AllHtmlEntities;
entities = new Entities();
var helper = require('../helper.js')

module.exports = function(msg, command, terms){
  if (command == 'reddit') {
    try {
      Reddit.user(terms).sort("new").limit(100).exec(function (data) {
        var postid = helper.getRandomInt(0, 100);
        if (typeof data.data == 'undefined'){
          msg.reply("reddit fucked up or you fucked up the persons reddit username");
        }
        else if (typeof data.data.children[postid] == 'undefined'){
          msg.reply("reddit fucked up or you fucked up the persons reddit username");
        } else if (typeof data.data.children[postid].data.body == 'undefined'){
          msg.reply("reddit fucked up or you fucked up the persons reddit username");
        } else {
          var subreddit = data.data.children[postid].data.subreddit;
          var body = data.data.children[postid].data.body;
          var decoded_body = entities.decode(body);
          var url = data.data.children[postid].data.link_permalink + data.data.children[postid].data.id;
          msg.reply("\n**username:** {0}\n **subreddit:** /r/{1}\n **comment:** {2}\n **link:** {3}".format(terms, subreddit, decoded_body, url))
        }

      })
    }
    catch (err){
      msg.reply("reddit fucked up or you fucked up the persons reddit username")
    }
  }
};

