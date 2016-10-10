var mongoose = require('mongoose');
var utils = require('../../services/utils');

var ToDo = mongoose.model('ToDo');
var TaskService = require('./task_update');

var _ = require('lodash');
var moment = require('moment');

// creates an empty todo object called when a user is registered
module.exports.createEmptyToDo = function(callback) {

  ToDo.create({
    tasks: [],
    completed: [],
    overDue: [],
    notCompleted: []
  }, function(err, todo) {
    if (err) {
      callback(false);
    } else {
      callback(todo._id);
    }
  });

};

//GET /todos/:todoid - List all the tasks from the todo
module.exports.listTasks = function(req, res) {

  var todoId = req.params.todoid;

  if (utils.checkParams(req, res, ['todoid'])) {
    return;
  }

  ToDo.findById(todoId)
  .exec(function(err, todo) {
    if(err) {
      utils.sendJSONresponse(res, 500, err);
    } else {

      //before listing tasks check if any tasks are overdue/completed
      TaskService.updateTasks(todo, function(status, err) {
        if(status){
          utils.sendJSONresponse(res, 200, todo.tasks);
        } else {
            utils.sendJSONresponse(res, 500, err);
        }
      });
    }
  });

};

//POST /todos/:todoid/task/:taskid - Creates a new task (todo item)
module.exports.addTask = function(req, res) {

  var todoId = req.params.todoid;

  if (utils.checkParams(req, res, ['todoid'])) {
    return;
  }

  ToDo.findById(todoId)
  .exec(function(err, todo) {
    if(err) {
      utils.sendJSONresponse(res, 500, err);
    } else {

      var newTask = {
        "text" : req.body.text,
        "occurrence" : req.body.occurrence,
        "complete" : false,
        "activeDays" : req.body.activeDays,
        "cycleDate" : new Date()
      };

      todo.tasks.push(newTask);

      todo.save(function(err, savedToDo) {
        if(err) {
          utils.sendJSONresponse(res, 500, err);
        } else {
          utils.sendJSONresponse(res, 200, todo.tasks[todo.tasks.length-1]);
        }
      });

    }
  });

};

//PUT /todos/:todoid/task/:taskid - Update a specific task
module.exports.updateTask = function(req, res) {

  var todoId = req.params.todoid;
  var taskId = req.params.taskid;

  if (utils.checkParams(req, res, ['todoid', 'taskid'])) {
    return;
  }

  ToDo.findById(todoId)
  .exec(function(err, todo) {
    if(err) {
      utils.sendJSONresponse(res, 500, err);
    } else {

      index = todo.tasks.indexOf(todo.tasks.id(taskId));

      if(index !== -1) {

        var task = req.body;

        if(task.complete === true) {
          task.completed.push({"counter" : 0, updatedOn: new Date()});
          task.current = false;
          task.cycleDate = new Date();
        }

        console.log(task);

        todo.tasks.set(index, task);

      } else {
        utils.sendJSONresponse(res, 500, {'message' : "Task with such an id not found"});
        return;
      }

      todo.save(function(err, savedToDo) {
        if(err) {
          utils.sendJSONresponse(res, 500, err);
          console.log(err);
        } else {
          utils.sendJSONresponse(res, 200, req.body);
        }
      });
    }
  });

};

//DELETE todos/:todoid/task/:taskid - Delete a specific task
module.exports.deleteTask = function(req, res) {

  var todoId = req.params.todoid;
  var taskId = req.params.taskid;

  if (utils.checkParams(req, res, ['todoid', 'taskid'])) {
    return;
  }

  ToDo.findById(todoId)
  .exec(function(err, todo) {
    if(err) {
      utils.sendJSONresponse(res, 500, err);
    } else {

      todo.tasks.id(taskId).remove();

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
