process.env.NODE_ENV = "test";
process.env.PORT = 5000;

var mongoose = require('mongoose');
var supertest = require('supertest');

require('../models/users');
require('../models/community');
require('../apila');

var userToken = "";
var server = supertest.agent("http://localhost:" + process.env.PORT);

before(function(done) {

  mongoose.connect("mongodb://localhost/apila_test");

  mongoose.connection.on('connected', function() {
    setupData(function() {
      done();
    });

  });
});

after(function() {
  mongoose.connection.db.dropDatabase();
});

//HELPER FUNCTIONS
function setupData(callback) {
  var userData = {
    "name" : "first",
    "email": "first@gmail.com",
    "password": "123456"
  };


  server
    .post('/api/register')
    .set('Accept', 'application/json')
    .send(userData)
    .expect(200)
    .end(function(err,res){
      userToken = res.body.token;
      callback();
    });

}

function getUserToken() {
  return userToken;
}


exports.server = server;
exports.getUserToken = getUserToken;
