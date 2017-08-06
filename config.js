var toml = require('toml');
var fs = require('fs');

exports.init = function(cb) {
    fs.readFile("config.toml", function(err, c) {
        if (!err) {
            c = toml.parse(c);
            let c1 = {
                _c: c,
                get: function(field) {
                    let o = this._c;
                    let p, ps = field.split('.');
                    for (var i = 0, len = ps.length - 1; i < len; i++) {
                        p = ps[i];
                        let newobj = o[p];
                        if (newobj !== undefined) {
                            o = newobj;
                        } else {
                            break;
                        }
                    }
                    return o[ps[i]];
                }
            };
            cb(c1);
        } else {
            console.error("Error: " + err);
        }
    })
};