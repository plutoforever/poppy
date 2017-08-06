var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

router.use(function (req,res,next) {
    console.log("/" + req.method);
    next();
});

router.get("/",function(req,res){
    res.sendFile(path + "index.html");
});

router.get("/duels",function(req,res){
    res.sendFile(path + "duels.html");
});

router.get("/gambles",function(req,res){
    res.sendFile(path + "gambles.html");
});

router.get("/balls",function(req,res){
    res.sendFile(path + "balls.html");
});

app.use("/",router);

let port = process.argv[2];

app.use(express.static(__dirname + '/views'));
app.listen(port,function(){
    console.log("Live at Port 80");
});
