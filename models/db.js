const mongoose = require('mongoose');
let gracefulShutdown;

let dbURI = "mongodb://localhost/apila";

const connectionConfig = {
    server: {
        keepAlive: 1,
        connectTimeoutMS: 30000,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000
    }
};

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    dbURI = process.env.MONGODB_URI;
}

if(process.env.NODE_ENV === 'test') {
  dbURI = "mongodb://localhost/apila_test";
}

mongoose.connect(dbURI, connectionConfig);

//Adding es6 promises instead of mongoose stuff
mongoose.Promise = global.Promise;

// CONNECTION EVENTS
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', (err) => {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = (msg, callback) => {
    mongoose.connection.close(() => {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};
// For nodemon restarts
process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
        process.kill(process.pid, 'SIGUSR2');
    });
});
// For app termination
process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
        process.exit(0);
    });
});
// For Heroku app termination
process.on('SIGTERM', () => {
    gracefulShutdown('Heroku app termination', () => {
        process.exit(0);
    });
});

// BRING IN YOUR SCHEMAS & MODELS
require('./issues');
require('./appointments');
require('./users');
require('./residents');
require('./chat');
require('./community');
require('./todo');
require('./activities');

/*

Restore from local to live database
mongorestore -h ds061787.mlab.com:61787 -d heroku_2hcbl7gs -u heroku_2hcbl7gs -p randomPassword ~/documents/loc8r/mongodump/loc8r

Connect using the mongo shell
mongo ds061787.mlab.com:61787/heroku_2hcbl7gs -u heroku_silly2132 -p randomPassword


*/
