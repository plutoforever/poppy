var jsonfile = require('jsonfile');
var helper = require('../helper.js');
var Chance = require('chance'),
    chance = new Chance();

var file = './www/views/data/data.json';

//me 238380816151871490
//aaron 123602598174523394


function donateWinner(msg, connections, amount){
    let id = msg.author.id;
    connections.filter(function(c) {return c.id === id}).forEach(function(a) {
        a.bank.total_bank = amount + a.bank.total_bank;
        msg.reply("\nRecieved: {0} \nNew total: {1}".format(amount, a.bank.total_bank));
    });
}

function donateLoser(omsg, connections, amount){
    let oid = omsg.author.id;
    connections.filter(function(c) {return c.id === oid}).forEach(function(a) {
        a.bank.total_bank = a.bank.total_bank - amount;
        omsg.reply("\nGave: {0} \nNew total: {1}".format(amount, a.bank.total_bank));

    });
}

function donate(msg, omsg, amount, connections){
    //take away from player
    donateLoser(msg, connections, amount);
    //give to opponent
    donateWinner(omsg, connections, amount);
    jsonfile.writeFileSync(file, connections, {spaces:2})

}

var duels = [];
var connections = [];

module.exports = function(msg, command, terms){
    if (command == 'donate') {
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

        //.donate accept
        if (args.length === 1 && challenger === "accept"){
            let possible = msg.author.id;
            duels.filter(function(d) {return d.challenger == possible }).forEach(function(duel) {
                msg.reply("Donation accepted");
                helper.tax(connections, duel.amount);
                donate(duel.msg, msg, duel.amount, connections);
                let index = duels.indexOf(duel);
                if (index > -1) {
                    duels.splice(index, 1);
                }
            })
        }
        //.donate decline
        else if (args.length === 1 && challenger === "decline"){
            let possible = msg.author.id;
            duels.filter(function(d) {return d.challenger == possible }).forEach(function(duel) {
                msg.reply("Donation declined,  <@{0}> is a lil proud broke back bitch.".format(msg.author.id));
                let index = duels.indexOf(duel);
                if (index > -1) {
                    duels.splice(index, 1);
                }
            })
        }
        //.donate @user <amount>
        else if(args.length === 2){
            jsonfile.readFile(file, function(err, obj) {
                if (typeof obj !== "undefined"){
                    connections = obj;
                    let username = msg.author.username;
                    let id = msg.author.id;
                    let passed = true;
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
                                msg.reply("Donation requested with <@{0}> for [ {1} ]. Type: '.donate accept' or '.donate decline'".format(duel.challenger, duel.amount));
                                setTimeout(function() {
                                    duels.forEach(function(duel){
                                        let index = duels.indexOf(duel);
                                        if (index > -1) {
                                            duels.splice(index, 1);
                                            msg.reply("Donation timed out. <@{0}> is a lil broke back bitch.".format(challenger))
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
                    msg.reply("\nTry .donate @name <amount>\nBank: {1} ".format(amount, a.bank.total_bank, a.duels.wins));
                });
            });



        }
    }
};

