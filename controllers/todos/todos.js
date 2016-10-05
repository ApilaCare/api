var mongoose = require('mongoose');
var utils = require('../../services/utils');

var ToDo = mongoose.model('ToDo');

var _ = require('lodash');
var moment = require('moment');

var occurrence = {
  "EVERY_HOUR" : 0,
  "TWICE_DAY" : 1,
  "EVERY_DAY" : 2,
  "EVERY_OTHER_DAY" : 3,
  "TWICE_WEEK" : 4,
  "EVERY_WEEK" : 5,
  "EVERY_TWO_WEEKS" : 6,
  "TWICE_MONTH" : 7,
  "EVERY_MONTH" : 8,
  "EVERY_TWO_MONTHS" : 9,
  "EVERY_QUATER" : 10,
  "TWICE_YEAR" : 11,
  "EVERY_YEAR" : 12,
};

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
      updateTasks(todo, function(status, err) {
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

  var todoId = req.utils.todoid;
  var taskId = req.utils.taskid;

  if (utils.checkParams(req, res, ['todoid', 'taskid'])) {
    return;
  }

  ToDo.findById(todoId)
  .exec(function(err, todo) {
    if(err) {
      utils.sendJSONresponse(res, 500, err);
    } else {
      //TODO: find our task and see if we can delete it
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

//if the task is current = true, show it in the current list of todoSchema
// when we set overudue/notcomplete we set current = false

// when a new day(cycle) rolls up we set current = true, so we need to remember
// on what cycle (date) we are

function updateTasks(todo, callback) {

  var tasks = todo.tasks;
  var currTime = moment();

  _.forEach(tasks, function(task) {

      inNewCycle(task);

      // if(task.occurrence === occurrence.EVERY_DAY) {
      //   //if it's past 12 pm it's overdue
      //   if(currTime.hour() >= 12) {
      //     console.log('overdue');
      //     //if we are already have overdue for this cycle dont push it
      //     task.overDue.push({"counter" : 0, updatedOn: new Date()});
      //   }
      // }

  });

  todo.tasks = tasks;

  todo.save(function(err) {
    if(err) {
      callback(false, err);
    } else {
      callback(true, err);
    }});

}

function inNewCycle(task) {

  var currTime = moment();
  var cycleDate = moment(task.cycleDate);

  if(task.occurrence === occurrence.EVERY_DAY) {
    //check if the current day and the cycle day is even to see if we are on the same cycle
    if(!currTime.isSame(cycleDate, "day")){
      console.log("Z date iz not d same");
      task.current = true;
      task.complete = false;
      task.cycleDate = new Date();
    }
  }
}
