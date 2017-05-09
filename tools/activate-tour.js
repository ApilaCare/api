// to run script on heroku:
// heroku run node ./app_api/tools/activate-tour.js --app apilatest

require('../models/db');

const mongoose = require('mongoose');
const User = mongoose.model('User');

const asyncLib = require('async');

(() => {
  User.find({}).exec(function(err, users) {
    if(!err) {

      console.log("Started updating users");

      asyncLib.each(users, function(user) {
        user.firstLogin = true;

        user.save();
      });

      console.log("Users updated");

    } else {
      console.log("Error while updating users");
    }
  });
})();
