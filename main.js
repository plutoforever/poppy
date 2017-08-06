const Discord = require('discord.js');
const client = new Discord.Client();
var fs = require('fs');
var path = require('path');
var helper = require('./helper.js');
var jsonfile = require('jsonfile');
var cmd = require('node-cmd');
require('log-timestamp')(function() { return '[' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + '] ' + '%s' });

var defaultPrefix, name, playing;
require('./config').init(function(config){
    name = config.get("bot.name");
    defaultPrefix = config.get("bot.prefix");
    playing = config.get("bot.playing");
    console.log("Bot name is: '{0}', using prefix: '{1}'".format(name, defaultPrefix));
    client.login(config.get("bot.secret"));

    let webEnabled = config.get("web.enabled");
    if(webEnabled){
        let port = config.get("web.port");
        cmd.run("node ./www/Server.js " + port)
        console.log("Web server started on port: " + port);
    }

    let commands = config.get("commands");
    for (command in commands){
        if(commands[command]){
            console.log("command loaded: " + path.join("./commands/"+ command));
            module.exports[path.basename(command, '.js')] = require("./commands/"+ command);
        }
    }

});


client.on('ready', () => {
    console.log('I am ready.');
    client.user.setGame(playing);
    client.user.setUsername(name);
});


var connections = [];

var file = './www/views/data/data.json';



/*
let gambles =  {
    biggest_win : "",
        biggest_loss : "",
        wins : "",
        losses: "",
        gamble_history: []
}
let duels =  {
    biggest_win : "",
        biggest_loss : "",
        wins : "",
        losses: "",
        duel_history: []
}

let bank = {
    biggest_bank : "",
    lowest_bank : "",
    total_bank : "",
    bank_history : []
}
*/


function checkPlayer(connections, player){
    let userID = player.user.id;
    if (connections == null) {
        return false;
    }
    return helper.checkArray(connections, userID, "id")
}
function createPlayer(connections, player){
    let userID = player.user.id;
    let username = player.user.username;
    let avatar = player.user.avatarURL;
    let time = Math.floor(new Date() / 1000);
    let newPlayer = {
        name : username,
        id : userID,
        avatar : avatar,
        connected : time,
        disconnected : 0,
        total_time : 0,
        duels :  {
            biggest_win : 0,
            biggest_loss : 0,
            wins : 0,
            losses: 0,
            duel_history: []
        },
        gambles :  {
            biggest_win : 0,
            biggest_loss : 0,
            wins : 0,
            losses: 0,
            gamble_history: []
        },
        bank : {
            biggest_bank : 0,
            lowest_bank : 0,
            total_bank : 1000000,
            bank_history : []
        }
    };
    //console.log(newPlayer);
    if (connections == null){
        let connections = [];
        console.log("fresh db");
        connections.push(newPlayer);
    } else {
        console.log("old db, new entry");
        connections.push(newPlayer);
    }
}
function updateConnected(connections, player){
    let userID = player.user.id;
    let time = Math.floor(new Date() / 1000);
    connections.filter(function(c) {return c.id === userID}).forEach(function(connection){
        console.log("updating connected");
        connection.connected = time;
    });
}
function updateDisconnected(connections, player){
    let userID = player.user.id;
    let time = Math.floor(new Date() / 1000);
    connections.filter(function(c) {return c.id === userID}).forEach(function(connection) {

        console.log("updating disconnected");
        connection.disconnected = time;
        connection.total_time = connection.total_time + connection.disconnected - connection.connected;
        connection.bank.total_bank += connection.disconnected - connection.connected;
    })
}

client.on("voiceStateUpdate", (oldMember, newMember) => {

    //connections = helper.loadData(file);

    jsonfile.readFile(file, function(err, obj) {
        console.log("file: "+obj);
        if (err){
            console.log("something broke")
        }else{
            connections = obj;
        }

        if (newMember.voiceChannelID === null){
            //they disconnected
            updateDisconnected(connections, oldMember);
        } else if (oldMember.voiceChannelID === null || oldMember.voiceChannelID === undefined ) {
            //they connected/moved
            if(checkPlayer(connections, oldMember)){
                console.log("player is: "+checkPlayer(connections, oldMember));
                updateConnected(connections, oldMember)
            } else {
                createPlayer(connections, oldMember)
            }
        }
        jsonfile.writeFile(file, connections,{spaces: 2}, function (err) {
            console.log("writing to data.json")
        })

    });
});


client.on('message', msg => {
    let terms = msg.content.split(" ");
    let prefix = terms[0].charAt(0);
    let command = terms.shift().substring(1);
    terms = terms.join(" ");

    for (x in this) {
        if (command === x && prefix === defaultPrefix) {
            console.log("command: {0}, arguments: '{1}', author: {2}".format(x, terms, msg.author.username));
            this[x](msg, command, terms);
            break;
        }
    }
});

