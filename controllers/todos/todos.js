var mongoose = require('mongoose');
var utils = require('../../services/utils');

var ToDo = mongoose.model('To-Do');


module.exports.createEmptyToDo = function(author, callback) {

  ToDo.create({
    todoItem: [],
    completed: [],
    overDue: [],
    notCompleted: [],
    createdBy: author,
  }, function(err, todo) {
    if (err) {
      callback(false);
    } else {
      callback(true);
    }
  });

};



/////////////////////////// HELPER FUNCTIONS ////////////////////////////
