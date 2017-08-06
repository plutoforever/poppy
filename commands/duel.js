var jsonfile = require('jsonfile');
var helper = require('../helper.js');
var Chance = require('chance'),
    chance = new Chance();

var file = './www/views/data/data.json';
let duelsjson = "./www/views/data/duels.json";

function duelWinner(msg, connections, amount){
    let id = msg.author.id;
    connections.filter(function(c) {return c.id === id}).forEach(function(a) {
        a.bank.total_bank = amount + a.bank.total_bank;
        a.duels.wins++;
        if (a.duels.biggest_win < amount)
            a.duels.biggest_win = amount;
        a.duels.duel_history.push(a.bank.total_bank);
        msg.reply("\nWon: {0} \nnew total: {1} \nWins: {2} \nLosses: {3} \nW/L: {4}%".format(amount, a.bank.total_bank, a.duels.wins, a.duels.losses,
            (parseInt(a.duels.wins) / (parseInt(a.duels.wins) + parseInt(a.duels.losses)) * 100).toFixed(2)));
    });
}

function duelLoser(omsg, connections, amount){
    let oid = omsg.author.id;
    connections.filter(function(c) {return c.id === oid}).forEach(function(a) {
        a.bank.total_bank = a.bank.total_bank - amount;
        a.duels.losses++;
        if (a.duels.biggest_loss > -amount)
            a.duels.biggest_loss = -amount;
        a.duels.duel_history.push(a.bank.total_bank);
        omsg.reply("\nLost: {0} \nnew total: {1} \nWins: {2} \nLosses: {3} \nW/L: {4}%".format(amount, a.bank.total_bank, a.duels.wins, a.duels.losses,
            (parseInt(a.duels.wins) / (parseInt(a.duels.wins) + parseInt(a.duels.losses)) * 100).toFixed(2)));

    });
}

function bet(msg, omsg, amount, connections){
    let winner = chance.weighted(['player', 'opponent'], [50, 50]);
    if(winner === "player"){
        //give player winnings
        duelWinner(msg, connections, amount);
        //take away from opponent
        duelLoser(omsg, connections, amount);
    } else {
        //take away from player
        duelLoser(msg, connections, amount);
        //give to opponent
        duelWinner(omsg, connections, amount);
    }
    jsonfile.writeFileSync(file, connections, {spaces:2})
    //add to duel history
    let newobj = {};
    connections.forEach(function(item) {
        if (item.hasOwnProperty("duels")) {
            newobj[item.name] = item.duels.duel_history;
        }
    });
    //console.log(newobj)
    jsonfile.writeFile(duelsjson, newobj, {spaces: 2}, function (err) {
        if (err)
            console.error(err);
        console.log("writing to duels.json")
    })
}

var duels = [];
var connections = [];

module.exports = function(msg, command, terms){
    if (command == 'duel') {
        let args = terms.split(" ");
        let player = msg.author;
        let challenger = args[0];
        if (challenger === "accept" || challenger === "decline"){
            //wtf
        }
        else {
            challenger = challenger.match(/\d+/g);
        }
        let amount = args[1];

        //.duel accept
        if (args.length === 1 && challenger === "accept"){
            let possible = msg.author.id;
            duels.filter(function(d) {return d.challenger == possible }).forEach(function(duel) {
                msg.reply("Duel accepted");
                helper.tax(connections, duel.amount);
                bet(duel.msg, msg, duel.amount, connections);
                let index = duels.indexOf(duel);
                if (index > -1) {
                    duels.splice(index, 1);
                }
            })
        }
        //.duel decline
        else if (args.length === 1 && challenger === "decline"){
            let possible = msg.author.id;
            duels.filter(function(d) {return d.challenger == possible }).forEach(function(duel) {
                msg.reply("Duel declined,  <@{0}> is a lil bitch.".format(msg.author.id));
                let index = duels.indexOf(duel);
                if (index > -1) {
                    duels.splice(index, 1);
                }
            })
        }
        //.duel @user <amount>
        else if(args.length === 2){
            jsonfile.readFile(file, function(err, obj) {
                if (typeof obj !== "undefined"){
                    connections = obj;
                    let username = msg.author.username;
                    let id = msg.author.id;
                    let passed = true;
                    connections.filter(function(c) {return c.id == challenger}).forEach(function(connection) {
                        let total = connection.bank.total_bank;
                        if(amount > total){
                            msg.reply("Invalid amount, your opponent's total is: " + total);
                            passed = false
                        }
                    });
                    if (passed){
                        connections.filter(function(c) {return c.name === username && c.id === id}).forEach(function(connection) {
                            let total = connection.bank.total_bank;
                            amount = parseInt(amount);
                            if (Number.isNaN(amount)){
                                msg.reply("Your total is: " + total)
                            } else if (amount > total || amount < 0){
                                msg.reply("Invalid amount, your total is: " + total)
                            }
                            else {
                                let duel = {
                                    msg : msg,
                                    player : player,
                                    challenger : challenger,
                                    amount: amount
                                };
                                //TODO need check for multiple duels from same person
                                duels.push(duel);
                                msg.reply("Duel requested with <@{0}> for [ {1} ]. Type: '.duel accept' or '.duel decline'".format(duel.challenger, duel.amount));
                                setTimeout(function() {
                                    duels.forEach(function(duel){
                                        let index = duels.indexOf(duel);
                                        if (index > -1) {
                                            duels.splice(index, 1);
                                            msg.reply("Duel timed out. <@{0}> is a lil bitch.".format(challenger))
                                        }
                                    })
                                }, 30000);

                            }
                        })
                    }
                }

            })
        } else {
            jsonfile.readFile(file, function(err, obj) {
                connections = obj;
                connections.filter(function(c) {return c.id == player.id}).forEach(function(a) {
                    msg.reply("\nTry .duel @name <amount>\nBank: {1} \nW: {2} \nL: {3} \nW/L: {4}%".format(amount, a.bank.total_bank, a.duels.wins, a.duels.losses,
                        (parseInt(a.duels.wins) / (parseInt(a.duels.wins) + parseInt(a.duels.losses)) * 100).toFixed(2)));
                });
            });



        }
    }
};

