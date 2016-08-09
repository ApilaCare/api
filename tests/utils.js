var mongoose = require('mongoose');

process.env.NODE_ENV = "test";

require('../models/users');
require('../models/community');
require('../apila');

before(function(done) {

  mongoose.connect("mongodb://localhost/apila_test");

  mongoose.connection.on('connected', function() {
    done();
  });
});


after(function() {
  mongoose.connection.db.dropDatabase();
});
