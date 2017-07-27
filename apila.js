require('dotenv').load();
var debug = require('debug')('Express4');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var cors = require('cors');
var helmet = require('helmet');

require('./services/activities')(io);

require('./models/db');
require('./config/passport');

require('./controllers/residents/resident_schedule');

// (commented out because routes in the server are not used)
// var routes = require('./app_server/routes/index');
var routesApi = require('./routes/index');

app.use(helmet());
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb', extended: true}));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

//error logging
app.use((err, req, res, next) => {
    console.log(err);

    res.status(500).send({err: err});
});

//so we can call our api from another server
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With' );

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use('/api', routesApi);
app.use('/files', express.static(__dirname + 'upload_storage'));
app.disable('etag');

app.set('port', process.env.PORT || 3300);


var server = http.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});


module.exports = app;
