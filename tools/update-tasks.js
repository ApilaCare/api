// to run script on heroku:
// heroku run node ./app_api/tools/ssn-encrypt.js --app apilatest

require('../models/db');

const mongoose = require('mongoose');
const User = mongoose.model('User');

const asyncLib = require('async');

const ToDo = mongoose.model('ToDo');


(() => {
  User.find({}).exec(function(err, users) {
    if(!err) {

      console.log("Started updating users");

      asyncLib.each(users, function(user) {
        
          ToDo.findById(user.todoid, function(err, todo) {

            setUserTasks(user._id, todo.tasks);

            todo.save();
          });

      });

    } else {
      console.log("Error while updating users");
    }
  });
})();


function setUserTasks(userid, tasks) {

    asyncLib.each(tasks, function(task) {

        task.responsibleParty = userid;
        task.submitBy = userid;

    });

}