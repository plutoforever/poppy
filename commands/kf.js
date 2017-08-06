var unirest = require('unirest');
var jsonfile = require('jsonfile');
var helper = require('../helper.js');

module.exports = function(msg, command, terms){
  if (command == 'kf') {
    var file = "kf.json";
    if (terms){
      var sep = terms.split(" ");
      if (sep[0] == "set"){
        var u = sep[1];
        var k = sep.slice(2, sep.length).join(" ");
        jsonfile.readFile(file, function(err, obj) {
          var entry = {name: u, knownfor: k}
          if (obj != null){
            var list = obj.list;
            for (var i = 0; i < list.length; i++){
              if (entry.name == list[i].name){
                list.splice(i, 1);
              }
            }
            obj.list.push(entry);
            jsonfile.writeFile(file, obj, function (err) {
              //console.error(err)
            })
          } else {
            var list = [];
            var obj = {list};
            obj.list.push(entry);
            jsonfile.writeFile(file, obj, function (err) {
              //console.error(err)
            })
          }
        });
        msg.reply("Added");
      } else {
        jsonfile.readFile(file, function(err, obj) {
          var list = obj.list;
          for (ele in list){
            if (list[ele].name == terms){
              var user = list[ele];
              msg.reply("\n**name:** {0} \n**known for:** {1}".format(user.name, user.knownfor));
            }
          }
        })
      }
    } else {
      jsonfile.readFile(file, function(err, obj) {
        var list = obj.list;
        for (ele in list){
          var user = list[ele];
          msg.reply("\n**name:** {0} \n**known for:** {1}\n".format(user.name, user.knownfor));
        }
      });
    }
  }
};

