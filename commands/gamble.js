var jsonfile = require('jsonfile');
var helper = require('../helper.js');
var Chance = require('chance'),
    chance = new Chance();

var file = './www/views/data/data.json';
let gamblesjson = "./www/views/data/gambles.json";
let time = Math.floor(new Date() / 1000);



function bet(msg, amount, connections, id) {
    let winner = chance.weighted(['player', 'house'], [49, 51]);
    //console.log(winner)
    //player won
    if (winner === "player") {
        connections.filter(function (c) {
            return c.id === id
        }).forEach(function (a) {
            a.bank.total_bank = amount + a.bank.total_bank;
            a.gambles.gamble_history.push(a.bank.total_bank);
            if (a.gambles.biggest_win < amount)
                a.gambles.biggest_win = amount;
            a.gambles.wins++
            msg.reply("won: {0}, new total: {1}".format(amount, a.bank.total_bank));
            jsonfile.writeFile(file, connections, {spaces: 2}, function (err) {
                if (err)
                    console.error(err)
                console.log("writing to data.json")
            });

        })
    } else {
        //player lost
        connections.filter(function (c) {
            return c.id === id
        }).forEach(function (a) {
            a.bank.total_bank = a.bank.total_bank - amount;
            msg.reply("lost: {0}, new total: {1}".format(amount, a.bank.total_bank));
            a.gambles.gamble_history.push(a.bank.total_bank);
            if (a.gambles.biggest_loss > -amount)
                a.gambles.biggest_loss = -amount;
            a.gambles.losses++
            jsonfile.writeFile(file, connections, {spaces: 2}, function (err) {
                if (err)
                    //console.error(err)
                console.log("writing to data.json")
            });

        })
    }
}



module.exports = function(msg, command, terms){
    if (command == 'gamble') {
        var connections = [];
        jsonfile.readFile(file, function(err, obj) {
            connections = obj;
            //console.log(obj);
            let username = msg.author.username;
            let id = msg.author.id;
            if (typeof obj !== "undefined"){
                connections.filter(function(c) {return c.name === username && c.id === id}).forEach(function(a) {
                    let total = a.bank.total_bank;
                    let amount = parseInt(terms);
                    if (Number.isNaN(amount)){
                        msg.reply("\nTry .gamble <amount>\nBank: {0}\nBiggest Win: {1}\nBiggest Loss: {2}\nWins: {3}\nLosses: {4}\nW/L: {5}%".format(a.bank.total_bank,
                            a.gambles.biggest_win, a.gambles.biggest_loss, a.gambles.wins, a.gambles.losses,
                            (parseInt(a.gambles.wins) / (parseInt(a.gambles.wins) + parseInt(a.gambles.losses)) * 100).toFixed(2)));
                    } else if (amount > total || amount < 0){
                        msg.reply("Invalid amount, your total is: " + total)
                    }
                    else {
                        //console.log(amount)
                        helper.tax(connections, amount);
                        bet(msg, amount, connections, id);
                    }
                })
            } else {
                msg.reply("You need to connect to a voice channel to start accumulating currency!")
            }
            //add to gamble_history
            let newobj = {};
            connections.forEach(function(item) {
                if (item.hasOwnProperty("gambles")) {
                    newobj[item.name] = item.gambles.gamble_history;
                }
            });
            //console.log(newobj)
            jsonfile.writeFile(gamblesjson, newobj, {spaces: 2}, function (err) {
                if (err)
                    console.error(err);
                console.log("writing to gambles.json")
            })

        })

    }
};

