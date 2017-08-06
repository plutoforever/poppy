var jsonfile = require('jsonfile');
var file = './www/views/data/data.json';

var recipients, percent, taxEnabled;
require('./config').init(function(config){
    taxEnabled = config.get("tax.enabled");
    if(taxEnabled){
        percent = config.get("tax.percent");
        console.log("Tax percentage: {0}".format(percent));
        recipients = config.get("tax.recipients");
    }

});

exports.tax = function(connections, amount){
    //pay tax recipients
    if(taxEnabled){
        for (recipient in recipients){
            connections.filter(function(c) {return c.id === recipients[recipient]}).forEach(function(a) {
                let tax = amount * percent;
                a.bank.total_bank = Math.ceil(tax + a.bank.total_bank);
                console.log("Tax paid. " + Math.ceil(tax));
            });
        }
        jsonfile.writeFileSync(file, connections, {spaces:2})
    }
};

exports.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.checkArray = function (array, key, prop){
    // Optional, but fallback to key['name'] if not selected
    prop = (typeof prop === 'undefined') ? 'name' : prop;

    for (var i=0; i < array.length; i++) {
        if (array[i][prop] === key) {
            return true;
        }
    }
};


exports.searchArray = function (array, key, prop){
    // Optional, but fallback to key['name'] if not selected
    prop = (typeof prop === 'undefined') ? 'name' : prop;
    for (var i=0; i < array.length; i++) {
        if (array[i][prop] === key) {
            return array[i];
        }
    }
};

String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
    });
  };
}

exports.loadData = function(file) {
    return jsonfile.readFileSync(file)

};