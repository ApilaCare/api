process.env.NODE_ENV = "test";
process.env.PORT = 5000;

var mongoose = require('mongoose');
var supertest = require('supertest');

require('../models/users');
require('../models/community');
require('../apila');

exports.server = supertest.agent("http://localhost:" + process.env.PORT);

before(function(done) {

  mongoose.connect("mongodb://localhost/apila_test");

  mongoose.connection.on('connected', function() {
    done();
  });
});


after(function() {
  mongoose.connection.db.dropDatabase();
});
