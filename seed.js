var mongoose = require('mongoose');
var async = require('async');

require('./models/db');

var User = mongoose.model('User');
var Community = mongoose.model('Community');

var USERS_NUM = 5;

var usersId = [];
var communityId = [];

mongoose.connection.on('connected', function() {

      mongoose.connection.db.dropDatabase();

      for(var i = 0; i < USERS_NUM; ++i) {
        createUser("test" + i, "test" + i +"@gmail.com", function(userid) {
          createTestCommunity("test", true, userid);
        });
      }

      //TODO: wait for the loop to finish

});

// create dummy user
function createUser(name, email, callback) {
  var user = new User();

  user.name = name;
  user.email = email;

  // use setPassword method to set salt and hash
  user.setPassword("123456");

  user.save(function(err, user) {
    console.log(user);
    usersId.push(user._id);
    callback(user._id);
  });
};

function createTestCommunity(name, test, creator) {
  Community.create({
      "name" : name,
      "communityMembers" : [creator],
      "pendingMembers" : [],
      "directors" : [],
      "minions" : [],
      "creator" : creator,
      "boss" : creator,
      "testCommunity" : test

  }, function(err, community) {
    communityId.push(community._id);

    User.findById(creator).exec(function(err, user) {
      user.community = community._id;

      user.save();

    });
  });
}
