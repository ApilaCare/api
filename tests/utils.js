var mongoose = require('mongoose');

require('../models/users');
require('../models/community');

before(function(done) {

  mongoose.connect("mongodb://localhost/apila_test");

  mongoose.connection.on('connected', function() {
    done();
  });
});


after(function() {
  mongoose.connection.db.dropDatabase();
});
