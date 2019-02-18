// ./server.js
// Load dependencies
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan       = require('morgan');
var Promise = require('bluebird');
mongoose.Promise = global.Promise;


var app = express();
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));

// mongoose.connect('mongodb://localhost:27017/newdemo', { useNewUrlParser: true });
mongoose.connect('mongodb://localhost:27017/newdemo', { useMongoClient: true });


//app.set('port', process.env.PORT || 4000);

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

// Routes
require('./routes')(app);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER IS RUNNING!");
});
