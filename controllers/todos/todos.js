var mongoose = require('mongoose');
var utils = require('../../services/utils');

var ToDo = mongoose.model('To-Do');

// creates an empty todo object called when a user is registered
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

//GET /todos/:todoid - List all the tasks from the todo
module.exports.listTasks = function(req, res) {

  var todoId = req.body.todoid;

  ToDo.findById(todoId)
  .exec(function(err, todo) {
    if(err) {
      utils.sendJSONresponse(res, 500, err);
    } else {
      utils.sendJSONresponse(res, 200, todo.tasks);
    }
  });

};

//POST /todos/:todoid/task/:taskid - Creates a new task (todo item)
module.exports.addTask = function(req, res) {

  var todoId = req.body.todoid;

  ToDo.findById(todoId)
  .exec(function(err, todo) {
    if(err) {
      utils.sendJSONresponse(res, 500, err);
    } else {

      todo.tasks.push(newTask);

      todo.save(function(err, savedToDo) {
        if(err) {
          utils.sendJSONresponse(res, 500, err);
        } else {
          utils.sendJSONresponse(res, 200, savedToDo);
        }
      });

    }
  });

};

//PUT /todos/:todoid/task/:taskid - Update a specific task
module.exports.updateTask = function(req, res) {

  var todoId = req.body.todoid;
  var taskId = req.body.taskid;

  ToDo.findById(todoId)
  .exec(function(err, todo) {
    if(err) {
      utils.sendJSONresponse(res, 500, err);
    } else {
      //TODO: find our task and update it with the new data

      todo.save(function(err, savedToDo) {
        if(err) {
          utils.sendJSONresponse(res, 500, err);
        } else {
          utils.sendJSONresponse(res, 200, savedToDo);
        }
      });
    }
  });

};

//DELETE todos/:todoid/task/:taskid - Delete a specific task
module.exports.deleteTask = function(req, res) {

  var todoId = req.body.todoid;
  var taskId = req.body.taskid;

  ToDo.findById(todoId)
  .exec(function(err, todo) {
    if(err) {
      utils.sendJSONresponse(res, 500, err);
    } else {
      //TODO: find our task and see if we can delete it

      todo.save(function(err, savedToDo) {
        if(err) {
          utils.sendJSONresponse(res, 500, err);
        } else {
          utils.sendJSONresponse(res, 200, savedToDo);
        }
      });
    }
  });

};
