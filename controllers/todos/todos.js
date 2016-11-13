var mongoose = require('mongoose');
var utils = require('../../services/utils');

var ToDo = mongoose.model('ToDo');
var TaskService = require('./task_update');

var _ = require('lodash');
var moment = require('moment');
const cons = require('../../services/constants');
const activitiesService = require('../../services/activities.service');

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

  let todoId = req.params.todoid;

  if (utils.checkParams(req, res, ['todoid'])) {
    return;
  }

  let newTask = {
    "text" : req.body.text,
    "occurrence" : req.body.occurrence,
    "state" : "current",
    "activeDays" : req.body.activeDays,
    "activeWeeks": req.body.activeWeeks,
    "activeMonths": req.body.activeMonths,
    "hourStart": req.body.hourStart,
    "hourEnd": req.body.hourEnd,
    "everyWeek": req.body.everyWeek,
    "everyMonth": req.body.everyMonth,
    "cycleDate" : new Date()
  };

  let userId = req.payload._id;

  let todo = ToDo.findById(todoId).exec();

  todo.then(todo => {
    if(todo) {
        todo.tasks.push(newTask);
        return todo;
    } else {
      utils.sendJSONresponse(res, 500, {"message": "ToDo is not created for this user"});
    }
  }, err => {
    utils.sendJSONresponse(res, 500, err);
  })
  .then(todo => {
    todo.save(function(err, savedToDo) {
      if(err) {
        utils.sendJSONresponse(res, 500, err);
      } else {
        activitiesService.addActivity(" created a task " + newTask.text, userId, "task-create", req.body.communityId);

        utils.sendJSONresponse(res, 200, todo.tasks[todo.tasks.length-1]);
      }
    });
  });

};

//PUT /todos/:todoid/task/:taskid - Update a specific task
module.exports.updateTask = function(req, res) {

  var todoId = req.params.todoid;
  var taskId = req.params.taskid;

  if (utils.checkParams(req, res, ['todoid', 'taskid'])) {
    return;
  }
  TaskService.loadMockTime(function(currentTime) {
  ToDo.findById(todoId)
  .exec(function(err, todo) {
    if(err) {
      utils.sendJSONresponse(res, 500, err);
    } else {

      let index = todo.tasks.indexOf(todo.tasks.id(taskId));
      let task = req.body;

      if(index !== -1) {

        if(task.state === "complete") {

          task.cycleDate = currentTime.toDate();

          if(!isOverdue(task, currentTime)) {
            task.completed.push({updatedOn: currentTime.toDate()});
          } else {
            task.overDue.push({updatedOn: currentTime.toDate()});
          }

        }

        // if we switched occurrence, reset other active set fields
        if(todo.tasks[index].occurrence !== task.occurrence) {
          switch(task.occurrence) {
            case cons.occurrence.HOURLY:
              setToDefault(task, ["daily", "weekly", "monthly"]);
            break;

            case cons.occurrence.DAILY:
              setToDefault(task, ["hourly", "weekly", "monthly"]);
            break;

            case cons.occurrence.WEEKLY:
              setToDefault(task, ["daily", "hourly", "monthly"]);
            break;

            case cons.occurrence.MONTHLY:
              setToDefault(task, ["daily", "weekly", "hourly"]);
            break;
          }

        }

        todo.tasks.set(index, task);

      } else {
        utils.sendJSONresponse(res, 500, {'message' : "Task with such an id not found"});
        return;
      }

      todo.save(function(err, savedToDo) {
        if(err) {
          utils.sendJSONresponse(res, 500, err);
        } else {
          utils.sendJSONresponse(res, 200, todo.tasks[todo.tasks.length - 1]);
        }
      });
    }
  });
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

      let task = todo.tasks.id(taskId);

      if(task) {
        task.remove();
      } else {
        utils.sendJSONresponse(res, 500, {message: "Invalid task id"});
        return;
      }

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


//////////////////////////// HELPER FUNCTION /////////////////////////////////

function isOverdue(task, currTime) {
  let overdue = false;

  let createdOn = moment(task.createdOn);

  switch(task.occurrence) {

    case cons.occurrence.HOURLY:
      if(currTime.minutes() >= 30 && !currTime.isSame(createdOn, "hour")) {
        overdue = true;
      }
    break;

    case cons.occurrence.DAILY:
      if(currTime.hour() >= 12 && !currTime.isSame(createdOn, "day")) {
        overdue = true;
      }
    break;

    case cons.occurrence.WEEKLY:
      if(currTime.day() > 2 && !currTime.isSame(createdOn, "week")) {
        overdue = true;
      }
    break;

    case cons.occurrence.MONTHLY:
      if((currTime.date() > (currTime.date() / 2)) && !currTime.isSame(createdOn, "month")) {
        overdue = true;
      }
    break;

    default:
      overdue = false;
  }

  return overdue;

}

function setToDefault(task, activeCycles) {
  _.forEach(activeCycles, function(cycle) {
    switch(cycle) {
      case "hourly" :
        task.hourStart = 0;
        task.hourEnd = 23;
      break;

      case "daily" :
        task.activeDays = [true, true, true, true, true, false, false];
      break;

      case "weekly" :
        task.everyWeek = false;
        task.activeWeeks = [false, false, false, false, false];
      break;

      case "monthly" :
        task.everyMonth = false;
        task.activeMonths = [false, false, false, false, false, false, false, false, false, false, false, false];
      break;
    }
  });
}
